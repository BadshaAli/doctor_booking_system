from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('PATIENT', 'Patient'),
        ('DOCTOR', 'Doctor'),
        ('ADMIN', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='PATIENT')
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.CharField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class DoctorProfile(models.Model):
    DISTRICT_CHOICES = (
        ('Dhaka', 'Dhaka'),
        ('Chittagong', 'Chittagong'),
        ('Sylhet', 'Sylhet'),
        ('Rajshahi', 'Rajshahi'),
        ('Khulna', 'Khulna'),
        ('Barisal', 'Barisal'),
        ('Rangpur', 'Rangpur'),
        ('Mymensingh', 'Mymensingh'),
        ('Comilla', 'Comilla'),
        ("Cox's Bazar", "Cox's Bazar"),
        ('Jashore', 'Jashore'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialty = models.CharField(max_length=100)
    qualification = models.CharField(max_length=200)
    experience_years = models.IntegerField(default=10)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=1500.00) # In BDT (Taka ৳)
    district = models.CharField(max_length=50, choices=DISTRICT_CHOICES, default='Dhaka')
    hospital = models.CharField(max_length=200, default='Square Hospital, Dhaka')
    bio = models.TextField(blank=True)
    rating = models.FloatField(default=4.9)
    total_reviews = models.IntegerField(default=0)
    image_url = models.CharField(max_length=500, blank=True, null=True)

    def __str__(self):
        full_name = self.user.get_full_name() or self.user.username
        return f"Dr. {full_name} - {self.specialty} ({self.district})"


class AvailabilitySlot(models.Model):
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='slots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.doctor} - {self.date} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"


class Appointment(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patient_appointments')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='doctor_appointments')
    slot = models.ForeignKey(AvailabilitySlot, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateField()
    time_slot = models.CharField(max_length=50)
    symptoms = models.TextField()
    patient_notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Appointment #{self.id}: {self.patient.username} with {self.doctor.user.username} on {self.date}"


class Prescription(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='prescription')
    diagnosis = models.TextField()
    medications = models.TextField()
    advice = models.TextField(blank=True, null=True)
    follow_up_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription for Appointment #{self.appointment.id}"


class Review(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_reviews')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.patient.username} for {self.doctor.user.username} ({self.rating} stars)"
