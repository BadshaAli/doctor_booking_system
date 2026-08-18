from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, DoctorProfile, AvailabilitySlot, Appointment, Prescription, Review


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ('username', 'get_full_name', 'role', 'email', 'phone', 'is_active', 'date_joined')
    list_filter   = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering      = ('-date_joined',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Bangladesh Doctor System', {'fields': ('role', 'phone', 'avatar')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Bangladesh Doctor System', {'fields': ('role', 'phone', 'avatar')}),
    )


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display  = ('__str__', 'specialty', 'district', 'hospital', 'consultation_fee', 'rating', 'total_reviews')
    list_filter   = ('specialty', 'district')
    search_fields = ('user__first_name', 'user__last_name', 'specialty', 'hospital', 'district')
    ordering      = ('district', 'specialty')
    readonly_fields = ('rating', 'total_reviews')


@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display  = ('doctor', 'date', 'start_time', 'end_time', 'is_booked')
    list_filter   = ('is_booked', 'date')
    search_fields = ('doctor__user__first_name', 'doctor__user__last_name')
    ordering      = ('-date', 'start_time')


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display  = ('id', 'patient', 'doctor', 'date', 'time_slot', 'status', 'created_at')
    list_filter   = ('status', 'date')
    search_fields = ('patient__username', 'patient__first_name', 'doctor__user__first_name', 'doctor__user__last_name')
    ordering      = ('-created_at',)
    list_editable = ('status',)
    actions       = ['mark_confirmed', 'mark_completed', 'mark_cancelled']

    @admin.action(description='Mark selected appointments as CONFIRMED')
    def mark_confirmed(self, request, queryset):
        queryset.update(status='CONFIRMED')

    @admin.action(description='Mark selected appointments as COMPLETED')
    def mark_completed(self, request, queryset):
        queryset.update(status='COMPLETED')

    @admin.action(description='Mark selected appointments as CANCELLED')
    def mark_cancelled(self, request, queryset):
        updated = queryset.update(status='CANCELLED')
        # Free up slots
        for app in queryset.filter(slot__isnull=False):
            if app.slot:
                app.slot.is_booked = False
                app.slot.save()
        self.message_user(request, f"{updated} appointment(s) cancelled.")


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display  = ('id', 'appointment', 'diagnosis', 'follow_up_date', 'created_at')
    search_fields = ('appointment__patient__username', 'diagnosis')
    ordering      = ('-created_at',)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ('id', 'patient', 'doctor', 'rating', 'created_at')
    list_filter   = ('rating',)
    search_fields = ('patient__username', 'doctor__user__first_name', 'comment')
    ordering      = ('-created_at',)
