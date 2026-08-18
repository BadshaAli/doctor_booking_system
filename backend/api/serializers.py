from rest_framework import serializers
from .models import User, DoctorProfile, AvailabilitySlot, Appointment, Prescription, Review

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'avatar']
        extra_kwargs = {'password': {'write_only': True}}


class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    # Flat convenience fields for admin tables
    user_first_name = serializers.SerializerMethodField()
    user_last_name  = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'user', 'user_first_name', 'user_last_name',
            'specialty', 'qualification', 'experience_years',
            'consultation_fee', 'district', 'hospital', 'bio', 'rating', 'total_reviews', 'image_url'
        ]

    def get_user_first_name(self, obj):
        return obj.user.first_name

    def get_user_last_name(self, obj):
        return obj.user.last_name


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = ['id', 'doctor', 'date', 'start_time', 'end_time', 'is_booked']


class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ['id', 'appointment', 'diagnosis', 'medications', 'advice', 'follow_up_date', 'created_at']


class AppointmentSerializer(serializers.ModelSerializer):
    patient      = UserSerializer(read_only=True)
    doctor       = DoctorProfileSerializer(read_only=True)
    doctor_id    = serializers.PrimaryKeyRelatedField(
        queryset=DoctorProfile.objects.all(), source='doctor', write_only=True
    )
    slot_id      = serializers.PrimaryKeyRelatedField(
        queryset=AvailabilitySlot.objects.all(), source='slot', write_only=True, required=False, allow_null=True
    )
    prescription = PrescriptionSerializer(read_only=True)

    # Flat convenience fields for admin display
    patient_name   = serializers.SerializerMethodField()
    doctor_name    = serializers.SerializerMethodField()
    doctor_specialty = serializers.SerializerMethodField()
    doctor_district  = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'doctor', 'doctor_id', 'slot', 'slot_id',
            'date', 'time_slot', 'symptoms', 'patient_notes', 'status',
            'created_at', 'prescription',
            'patient_name', 'doctor_name', 'doctor_specialty', 'doctor_district',
        ]

    def get_patient_name(self, obj):
        return obj.patient.get_full_name() or obj.patient.username

    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name() or obj.doctor.user.username

    def get_doctor_specialty(self, obj):
        return obj.doctor.specialty

    def get_doctor_district(self, obj):
        return obj.doctor.district


class ReviewSerializer(serializers.ModelSerializer):
    patient      = UserSerializer(read_only=True)
    patient_name = serializers.SerializerMethodField()
    doctor_name  = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'patient', 'doctor', 'rating', 'comment', 'created_at', 'patient_name', 'doctor_name']

    def get_patient_name(self, obj):
        return obj.patient.get_full_name() or obj.patient.username

    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name() or obj.doctor.user.username
