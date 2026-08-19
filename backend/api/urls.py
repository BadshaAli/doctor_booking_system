from django.urls import path
from .views import (
    RegisterView, LoginView, DemoAuthView, CurrentProfileView,
    DoctorListView, DoctorDetailView, DoctorSlotsView,
    BookAppointmentView, PatientAppointmentsView, DoctorAppointmentsView,
    UpdateAppointmentStatusView, CreatePrescriptionView, CreateReviewView,
    DoctorStatsView,
    # Admin
    AdminStatsView, AdminAllAppointmentsView, AdminAllDoctorsView,
    AdminAllPatientsView, AdminAllReviewsView,
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/demo/', DemoAuthView.as_view(), name='demo-auth'),
    path('auth/profile/', CurrentProfileView.as_view(), name='current-profile'),

    # Doctors
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('doctors/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
    path('doctors/<int:doctor_id>/slots/', DoctorSlotsView.as_view(), name='doctor-slots'),
    path('doctor/slots/', DoctorSlotsView.as_view(), name='my-doctor-slots'),


    # Appointments
    path('appointments/book/', BookAppointmentView.as_view(), name='book-appointment'),
    path('appointments/patient/', PatientAppointmentsView.as_view(), name='patient-appointments'),
    path('appointments/doctor/', DoctorAppointmentsView.as_view(), name='doctor-appointments'),
    path('appointments/<int:pk>/status/', UpdateAppointmentStatusView.as_view(), name='update-appointment-status'),

    # Medical & Reviews
    path('prescriptions/create/', CreatePrescriptionView.as_view(), name='create-prescription'),
    path('reviews/create/', CreateReviewView.as_view(), name='create-review'),
    path('doctor/stats/', DoctorStatsView.as_view(), name='doctor-stats'),

    # ── Admin Endpoints ──────────────────────────────
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/appointments/', AdminAllAppointmentsView.as_view(), name='admin-appointments'),
    path('admin/appointments/<int:pk>/', AdminAllAppointmentsView.as_view(), name='admin-appointment-detail'),
    path('admin/doctors/', AdminAllDoctorsView.as_view(), name='admin-doctors'),
    path('admin/doctors/<int:pk>/', AdminAllDoctorsView.as_view(), name='admin-doctor-detail'),
    path('admin/patients/', AdminAllPatientsView.as_view(), name='admin-patients'),
    path('admin/patients/<int:pk>/', AdminAllPatientsView.as_view(), name='admin-patient-detail'),
    path('admin/reviews/', AdminAllReviewsView.as_view(), name='admin-reviews'),
    path('admin/reviews/<int:pk>/', AdminAllReviewsView.as_view(), name='admin-review-detail'),
]
