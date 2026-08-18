from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Q, Count, Sum
from datetime import date, datetime

from .models import User, DoctorProfile, AvailabilitySlot, Appointment, Prescription, Review
from .serializers import (
    UserSerializer, DoctorProfileSerializer, AvailabilitySlotSerializer,
    AppointmentSerializer, PrescriptionSerializer, ReviewSerializer
)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        role = request.data.get('role', 'PATIENT')
        phone = request.data.get('phone', '')

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role,
            phone=phone
        )

        doctor_profile_data = None
        if role == 'DOCTOR':
            specialty = request.data.get('specialty', 'Internal Medicine')
            qualification = request.data.get('qualification', 'MBBS, FCPS')
            experience_years = request.data.get('experience_years', 10)
            consultation_fee = request.data.get('consultation_fee', 1500.00)
            district = request.data.get('district', 'Dhaka')
            hospital = request.data.get('hospital', 'Square Hospital, Dhaka')
            bio = request.data.get('bio', 'Dedicated Bangladeshi healthcare specialist.')

            doc_profile = DoctorProfile.objects.create(
                user=user,
                specialty=specialty,
                qualification=qualification,
                experience_years=experience_years,
                consultation_fee=consultation_fee,
                district=district,
                hospital=hospital,
                bio=bio
            )
            doctor_profile_data = DoctorProfileSerializer(doc_profile).data

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'doctor_profile': doctor_profile_data
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid username or password'}, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user)
        doctor_profile_data = None
        if hasattr(user, 'doctor_profile'):
            doctor_profile_data = DoctorProfileSerializer(user.doctor_profile).data

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'doctor_profile': doctor_profile_data
        })


class DemoAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        role = request.data.get('role', 'PATIENT')
        username = request.data.get('username')

        user = None
        if username:
            clean_username = str(username).strip().lower().replace(' ', '')
            user = User.objects.filter(username__iexact=clean_username).first()
            if not user:
                # Try finding by first name or last name
                user = User.objects.filter(
                    Q(username__icontains=clean_username) |
                    Q(first_name__icontains=clean_username) |
                    Q(last_name__icontains=clean_username)
                ).first()

        if not user:
            if role == 'DOCTOR':
                user = User.objects.filter(role='DOCTOR').first()
            elif role == 'ADMIN':
                user = User.objects.filter(role='ADMIN').first()
            else:
                user = User.objects.filter(role='PATIENT').first()

        if not user:
            return Response({'error': 'Demo user not found. Please run seed_data first.'}, status=status.HTTP_404_NOT_FOUND)

        token, _ = Token.objects.get_or_create(user=user)
        doctor_profile_data = None
        if hasattr(user, 'doctor_profile'):
            doctor_profile_data = DoctorProfileSerializer(user.doctor_profile).data

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'doctor_profile': doctor_profile_data
        })



class CurrentProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        doctor_profile_data = None
        if hasattr(user, 'doctor_profile'):
            doctor_profile_data = DoctorProfileSerializer(user.doctor_profile).data

        return Response({
            'user': UserSerializer(user).data,
            'doctor_profile': doctor_profile_data
        })


class DoctorListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        search_query = request.query_params.get('query', '')
        specialty = request.query_params.get('specialty', '')
        district = request.query_params.get('district', '')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        sort_by = request.query_params.get('sort_by', '-rating')

        doctors = DoctorProfile.objects.all().select_related('user')

        if search_query:
            doctors = doctors.filter(
                Q(user__first_name__icontains=search_query) |
                Q(user__last_name__icontains=search_query) |
                Q(specialty__icontains=search_query) |
                Q(hospital__icontains=search_query) |
                Q(district__icontains=search_query)
            )

        if specialty and specialty != 'All':
            doctors = doctors.filter(specialty__iexact=specialty)

        if district and district != 'All':
            doctors = doctors.filter(district__iexact=district)

        if min_price:
            doctors = doctors.filter(consultation_fee__gte=min_price)

        if max_price:
            doctors = doctors.filter(consultation_fee__lte=max_price)

        if sort_by in ['rating', '-rating', 'consultation_fee', '-consultation_fee', 'experience_years', '-experience_years']:
            doctors = doctors.order_by(sort_by)

        serializer = DoctorProfileSerializer(doctors, many=True)
        
        specialties = list(DoctorProfile.objects.values_list('specialty', flat=True).distinct())
        districts = list(DoctorProfile.objects.values_list('district', flat=True).distinct())

        return Response({
            'doctors': serializer.data,
            'specialties': sorted(specialties),
            'districts': sorted(districts)
        })


class DoctorDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            doctor = DoctorProfile.objects.select_related('user').get(pk=pk)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)

        doctor_data = DoctorProfileSerializer(doctor).data
        slots = AvailabilitySlot.objects.filter(doctor=doctor, is_booked=False, date__gte=date.today())
        slots_data = AvailabilitySlotSerializer(slots, many=True).data

        reviews = Review.objects.filter(doctor=doctor).select_related('patient')
        reviews_data = ReviewSerializer(reviews, many=True).data

        return Response({
            'doctor': doctor_data,
            'available_slots': slots_data,
            'reviews': reviews_data
        })


class DoctorSlotsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request, doctor_id):
        slots = AvailabilitySlot.objects.filter(doctor_id=doctor_id, date__gte=date.today())
        return Response(AvailabilitySlotSerializer(slots, many=True).data)

    def post(self, request, doctor_id):
        if not hasattr(request.user, 'doctor_profile') or request.user.doctor_profile.id != int(doctor_id):
            return Response({'error': 'Unauthorized to manage these slots'}, status=status.HTTP_403_FORBIDDEN)

        slot_date = request.data.get('date')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')

        if not slot_date or not start_time or not end_time:
            return Response({'error': 'Date, start_time and end_time are required'}, status=status.HTTP_400_BAD_REQUEST)

        slot = AvailabilitySlot.objects.create(
            doctor_id=doctor_id,
            date=slot_date,
            start_time=start_time,
            end_time=end_time,
            is_booked=False
        )
        return Response(AvailabilitySlotSerializer(slot).data, status=status.HTTP_201_CREATED)

    def delete(self, request, doctor_id):
        slot_id = request.data.get('slot_id')
        try:
            slot = AvailabilitySlot.objects.get(pk=slot_id, doctor_id=doctor_id)
            if slot.doctor.user != request.user:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            slot.delete()
            return Response({'message': 'Slot deleted successfully'})
        except AvailabilitySlot.DoesNotExist:
            return Response({'error': 'Slot not found'}, status=status.HTTP_404_NOT_FOUND)


class BookAppointmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        patient = request.user
        doctor_id = request.data.get('doctor_id')
        slot_id = request.data.get('slot_id')
        app_date = request.data.get('date')
        time_slot = request.data.get('time_slot')
        symptoms = request.data.get('symptoms', '')
        patient_notes = request.data.get('patient_notes', '')

        try:
            doctor = DoctorProfile.objects.get(pk=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)

        slot = None
        if slot_id:
            try:
                slot = AvailabilitySlot.objects.get(pk=slot_id)
                if slot.is_booked:
                    return Response({'error': 'This time slot is already booked.'}, status=status.HTTP_400_BAD_REQUEST)
                slot.is_booked = True
                slot.save()
                app_date = slot.date
                time_slot = f"{slot.start_time.strftime('%I:%M %p')} - {slot.end_time.strftime('%I:%M %p')}"
            except AvailabilitySlot.DoesNotExist:
                pass

        if not app_date or not time_slot:
            return Response({'error': 'Appointment date and time slot are required'}, status=status.HTTP_400_BAD_REQUEST)

        appointment = Appointment.objects.create(
            patient=patient,
            doctor=doctor,
            slot=slot,
            date=app_date,
            time_slot=time_slot,
            symptoms=symptoms,
            patient_notes=patient_notes,
            status='PENDING'
        )

        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)


class PatientAppointmentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        appointments = Appointment.objects.filter(patient=request.user).select_related('doctor', 'doctor__user', 'prescription')
        return Response(AppointmentSerializer(appointments, many=True).data)


class DoctorAppointmentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'doctor_profile'):
            return Response({'error': 'User is not a doctor'}, status=status.HTTP_403_FORBIDDEN)

        appointments = Appointment.objects.filter(doctor=request.user.doctor_profile).select_related('patient', 'prescription')
        return Response(AppointmentSerializer(appointments, many=True).data)


class UpdateAppointmentStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

        is_patient = appointment.patient == request.user
        is_doctor = hasattr(request.user, 'doctor_profile') and appointment.doctor == request.user.doctor_profile
        is_admin = request.user.role == 'ADMIN'

        if not (is_patient or is_doctor or is_admin):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if new_status not in ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        appointment.status = new_status
        appointment.save()

        if new_status == 'CANCELLED' and appointment.slot:
            appointment.slot.is_booked = False
            appointment.slot.save()

        return Response(AppointmentSerializer(appointment).data)


class CreatePrescriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'doctor_profile'):
            return Response({'error': 'Only doctors can issue prescriptions'}, status=status.HTTP_403_FORBIDDEN)

        appointment_id = request.data.get('appointment_id')
        diagnosis = request.data.get('diagnosis')
        medications = request.data.get('medications')
        advice = request.data.get('advice', '')
        follow_up_date = request.data.get('follow_up_date')

        try:
            appointment = Appointment.objects.get(pk=appointment_id, doctor=request.user.doctor_profile)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

        prescription, created = Prescription.objects.update_or_create(
            appointment=appointment,
            defaults={
                'diagnosis': diagnosis,
                'medications': medications,
                'advice': advice,
                'follow_up_date': follow_up_date if follow_up_date else None
            }
        )

        appointment.status = 'COMPLETED'
        appointment.save()

        return Response(PrescriptionSerializer(prescription).data, status=status.HTTP_201_CREATED)


class CreateReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        doctor_id = request.data.get('doctor_id')
        rating = request.data.get('rating', 5)
        comment = request.data.get('comment', '')

        try:
            doctor = DoctorProfile.objects.get(pk=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)

        review = Review.objects.create(
            patient=request.user,
            doctor=doctor,
            rating=rating,
            comment=comment
        )

        all_reviews = Review.objects.filter(doctor=doctor)
        avg_rating = sum(r.rating for r in all_reviews) / float(len(all_reviews))
        doctor.rating = round(avg_rating, 1)
        doctor.total_reviews = len(all_reviews)
        doctor.save()

        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


class DoctorStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'doctor_profile'):
            return Response({'error': 'User is not a doctor'}, status=status.HTTP_403_FORBIDDEN)

        doctor = request.user.doctor_profile
        today = date.today()

        today_appointments = Appointment.objects.filter(doctor=doctor, date=today).count()
        pending_requests = Appointment.objects.filter(doctor=doctor, status='PENDING').count()
        completed_consultations = Appointment.objects.filter(doctor=doctor, status='COMPLETED').count()
        total_appointments = Appointment.objects.filter(doctor=doctor).count()
        
        earned = Appointment.objects.filter(doctor=doctor, status='COMPLETED').count() * float(doctor.consultation_fee)

        return Response({
            'today_appointments': today_appointments,
            'pending_requests': pending_requests,
            'completed_consultations': completed_consultations,
            'total_appointments': total_appointments,
            'total_earnings': round(earned, 2),
            'rating': doctor.rating,
            'total_reviews': doctor.total_reviews
        })


# ─────────────────────────────────────────────
#  ADMIN VIEWS
# ─────────────────────────────────────────────

class IsAdmin(permissions.BasePermission):
    """Allow access only to users with role=ADMIN."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class AdminStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = date.today()
        total_doctors   = User.objects.filter(role='DOCTOR').count()
        total_patients  = User.objects.filter(role='PATIENT').count()
        total_appointments = Appointment.objects.count()
        today_appointments = Appointment.objects.filter(date=today).count()
        pending_appointments = Appointment.objects.filter(status='PENDING').count()
        completed_appointments = Appointment.objects.filter(status='COMPLETED').count()
        cancelled_appointments = Appointment.objects.filter(status='CANCELLED').count()
        confirmed_appointments = Appointment.objects.filter(status='CONFIRMED').count()
        total_reviews = Review.objects.count()
        total_prescriptions = Prescription.objects.count()

        # Revenue estimate (completed appointments × fee)
        revenue = 0
        for app in Appointment.objects.filter(status='COMPLETED').select_related('doctor'):
            revenue += float(app.doctor.consultation_fee)

        # Doctors per district
        district_counts = list(
            DoctorProfile.objects.values('district').annotate(count=Count('id')).order_by('-count')
        )

        # Appointments per status
        status_breakdown = {
            'PENDING': pending_appointments,
            'CONFIRMED': confirmed_appointments,
            'COMPLETED': completed_appointments,
            'CANCELLED': cancelled_appointments,
        }

        return Response({
            'total_doctors': total_doctors,
            'total_patients': total_patients,
            'total_appointments': total_appointments,
            'today_appointments': today_appointments,
            'pending_appointments': pending_appointments,
            'completed_appointments': completed_appointments,
            'cancelled_appointments': cancelled_appointments,
            'confirmed_appointments': confirmed_appointments,
            'total_reviews': total_reviews,
            'total_prescriptions': total_prescriptions,
            'total_revenue': round(revenue, 2),
            'district_counts': district_counts,
            'status_breakdown': status_breakdown,
        })


class AdminAllAppointmentsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        status_filter = request.query_params.get('status', '')
        search = request.query_params.get('search', '')

        appointments = Appointment.objects.select_related(
            'patient', 'doctor', 'doctor__user', 'prescription'
        ).order_by('-created_at')

        if status_filter and status_filter != 'All':
            appointments = appointments.filter(status=status_filter)

        if search:
            appointments = appointments.filter(
                Q(patient__first_name__icontains=search) |
                Q(patient__last_name__icontains=search) |
                Q(patient__username__icontains=search) |
                Q(doctor__user__first_name__icontains=search) |
                Q(doctor__user__last_name__icontains=search)
            )

        return Response(AppointmentSerializer(appointments, many=True).data)

    def patch(self, request, pk):
        """Admin can update any appointment status."""
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        appointment.status = new_status
        appointment.save()

        if new_status == 'CANCELLED' and appointment.slot:
            appointment.slot.is_booked = False
            appointment.slot.save()

        return Response(AppointmentSerializer(appointment).data)


class AdminAllDoctorsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        search = request.query_params.get('search', '')
        district = request.query_params.get('district', '')

        doctors = DoctorProfile.objects.select_related('user').all()

        if search:
            doctors = doctors.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(specialty__icontains=search) |
                Q(hospital__icontains=search)
            )

        if district and district != 'All':
            doctors = doctors.filter(district__iexact=district)

        serializer = DoctorProfileSerializer(doctors, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        """Admin can remove a doctor."""
        try:
            doctor = DoctorProfile.objects.get(pk=pk)
            user = doctor.user
            doctor.delete()
            user.delete()
            return Response({'message': 'Doctor removed successfully'})
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminAllPatientsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        search = request.query_params.get('search', '')
        patients = User.objects.filter(role='PATIENT').order_by('-date_joined')

        if search:
            patients = patients.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(username__icontains=search) |
                Q(email__icontains=search)
            )

        data = []
        for p in patients:
            appt_count = Appointment.objects.filter(patient=p).count()
            data.append({
                'id': p.id,
                'username': p.username,
                'full_name': p.get_full_name() or p.username,
                'email': p.email,
                'phone': p.phone,
                'date_joined': p.date_joined,
                'is_active': p.is_active,
                'total_appointments': appt_count,
            })

        return Response(data)

    def patch(self, request, pk):
        """Admin can toggle patient active/inactive."""
        try:
            user = User.objects.get(pk=pk, role='PATIENT')
        except User.DoesNotExist:
            return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)

        user.is_active = not user.is_active
        user.save()
        return Response({'is_active': user.is_active, 'message': f"Account {'activated' if user.is_active else 'deactivated'}"})


class AdminAllReviewsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        reviews = Review.objects.select_related('patient', 'doctor', 'doctor__user').order_by('-created_at')
        return Response(ReviewSerializer(reviews, many=True).data)

    def delete(self, request, pk):
        """Admin can delete a review."""
        try:
            review = Review.objects.get(pk=pk)
            doctor = review.doctor
            review.delete()
            # Recalculate doctor rating
            remaining = Review.objects.filter(doctor=doctor)
            if remaining.exists():
                avg = sum(r.rating for r in remaining) / float(remaining.count())
                doctor.rating = round(avg, 1)
                doctor.total_reviews = remaining.count()
            else:
                doctor.rating = 0
                doctor.total_reviews = 0
            doctor.save()
            return Response({'message': 'Review deleted'})
        except Review.DoesNotExist:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
