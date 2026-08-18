from django.core.management.base import BaseCommand
from api.models import User, Appointment, Prescription, Review

class Command(BaseCommand):
    help = 'Removes test/demo patients and their demo appointments/prescriptions while preserving real accounts.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--include-doctors',
            action='store_true',
            help='Also remove seeded demo doctors (use with caution)',
        )

    def handle(self, *args, **options):
        demo_patients = ['rahimuddin', 'fatemabegum', 'tanvirahmed', 'nusratjahan']

        self.stdout.write("Removing demo patient appointments, prescriptions, and reviews...")
        patient_users = User.objects.filter(username__in=demo_patients)
        
        for p in patient_users:
            appts = Appointment.objects.filter(patient=p)
            Prescription.objects.filter(appointment__in=appts).delete()
            Review.objects.filter(patient=p).delete()
            appts.delete()

        deleted_count, _ = patient_users.delete()
        self.stdout.write(self.style.SUCCESS(f"Successfully deleted {deleted_count} demo patient accounts and their records."))

        if options.get('include_doctors'):
            self.stdout.write("Removing demo doctors...")
            demo_doc_usernames = [
                'abmabdullah', 'mustafazaman', 'samantalsen', 'deenmohd', 'kamrulhasan',
                'shahanarahman', 'sanawarhossain', 'fakhrulislam', 'fazlulhaque', 'syedkamal',
                'tariqulislam', 'mizanurrahman', 'anamulhaque', 'ashrafulalam', 'moniruzzaman',
                'mujiburrahman', 'aniskhan', 'abdulmomen', 'mostafizurrahman', 'hasanuzzaman',
                'sirajulhossain', 'delwarhossain', 'rashedulhasan', 'asaduzzaman', 'khalidhasan'
            ]
            doc_users = User.objects.filter(username__in=demo_doc_usernames)
            doc_count, _ = doc_users.delete()
            self.stdout.write(self.style.SUCCESS(f"Successfully deleted {doc_count} demo doctor accounts."))

        self.stdout.write(self.style.SUCCESS("Demo cleanup complete! Real users and admin remain intact."))
