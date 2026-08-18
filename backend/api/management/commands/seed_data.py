from django.core.management.base import BaseCommand
from datetime import date, timedelta, time
from api.models import User, DoctorProfile, AvailabilitySlot, Appointment, Prescription, Review

class Command(BaseCommand):
    help = 'Seeds database with AmarDoctor Bangladeshi demo users, famous doctors, and realistic appointments.'

    def handle(self, *args, **kwargs):
        DEFAULT_PASSWORD = 'bad1234$'

        self.stdout.write("Clearing existing seed data...")
        Review.objects.all().delete()
        Prescription.objects.all().delete()
        Appointment.objects.all().delete()
        AvailabilitySlot.objects.all().delete()
        DoctorProfile.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

        self.stdout.write("Creating AmarDoctor Bangladeshi demo patients (password: bad1234$)...")
        patient_rahim = User.objects.create_user(
            username='rahimuddin',
            password=DEFAULT_PASSWORD,
            email='rahim.uddin@gmail.com',
            first_name='Rahim',
            last_name='Uddin',
            role='PATIENT',
            phone='+880 1711-234567',
        )

        patient_fatema = User.objects.create_user(
            username='fatemabegum',
            password=DEFAULT_PASSWORD,
            email='fatema.begum@gmail.com',
            first_name='Fatema',
            last_name='Begum',
            role='PATIENT',
            phone='+880 1819-876543',
        )

        patient_tanvir = User.objects.create_user(
            username='tanvirahmed',
            password=DEFAULT_PASSWORD,
            email='tanvir.ahmed@gmail.com',
            first_name='Tanvir',
            last_name='Ahmed',
            role='PATIENT',
            phone='+880 1912-345678',
        )

        patient_nusrat = User.objects.create_user(
            username='nusratjahan',
            password=DEFAULT_PASSWORD,
            email='nusrat.jahan@gmail.com',
            first_name='Nusrat',
            last_name='Jahan',
            role='PATIENT',
            phone='+880 1610-987654',
        )

        self.stdout.write("Creating AmarDoctor admin user (admin / bad1234$)...")
        admin_user = User.objects.create_user(
            username='admin',
            password=DEFAULT_PASSWORD,
            email='admin@amardoctor.com.bd',
            first_name='System',
            last_name='Admin',
            role='ADMIN',
            phone='+880 1700-000000',
            is_staff=True,
        )

        self.stdout.write("Creating famous Bangladeshi doctor profiles (password: bad1234$)...")
        doctors_data = [
            # ─── DHAKA ───
            {
                'username': 'abmabdullah',
                'password': DEFAULT_PASSWORD,
                'first_name': 'ABM',
                'last_name': 'Abdullah',
                'email': 'abdullah@squarehospital.com',
                'specialty': 'Internal Medicine',
                'qualification': 'National Professor, FCPS (Medicine), FRCP (London)',
                'experience_years': 35,
                'consultation_fee': 1500.00,
                'district': 'Dhaka',
                'hospital': 'Square Hospital, Panthapath, Dhaka',
                'bio': 'National Professor of Medicine. Former Dean of Medicine, BSMMU. Personal Physician to the Prime Minister of Bangladesh. Renowned for internal medicine, hypertension, and metabolic disorders.',
                'rating': 4.98,
                'total_reviews': 215,
            },
            {
                'username': 'mustafazaman',
                'password': DEFAULT_PASSWORD,
                'first_name': 'S.M. Mustafa',
                'last_name': 'Zaman',
                'email': 'mustafa.zaman@bsmmu.edu.bd',
                'specialty': 'Cardiology',
                'qualification': 'MBBS, MD (Cardiology), FCPS, FACC (USA)',
                'experience_years': 25,
                'consultation_fee': 1200.00,
                'district': 'Dhaka',
                'hospital': 'Bangabandhu Sheikh Mujib Medical University (BSMMU), Shahbagh, Dhaka',
                'bio': 'Senior Professor of Cardiology at BSMMU. Pioneer in interventional cardiology and preventive cardiovascular health in Bangladesh.',
                'rating': 4.92,
                'total_reviews': 180,
            },
            {
                'username': 'samantalsen',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Samanta Lal',
                'last_name': 'Sen',
                'email': 'samanta.sen@burninstitute.gov.bd',
                'specialty': 'General Surgery',
                'qualification': 'MBBS, MS (Plastic Surgery), Hon. FCPS',
                'experience_years': 40,
                'consultation_fee': 1500.00,
                'district': 'Dhaka',
                'hospital': 'Sheikh Hasina National Institute of Burn and Plastic Surgery, Dhaka',
                'bio': 'Former Minister of Health and pioneer of plastic & burn surgery in Bangladesh. Chief Coordinator of National Burn & Plastic Surgery network.',
                'rating': 4.97,
                'total_reviews': 340,
            },
            {
                'username': 'deenmohd',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Deen Mohd.',
                'last_name': 'Noorul Huq',
                'email': 'deen.noorul@nio.gov.bd',
                'specialty': 'Ophthalmology',
                'qualification': 'MBBS, FCPS (Ophth), FICS',
                'experience_years': 32,
                'consultation_fee': 1000.00,
                'district': 'Dhaka',
                'hospital': 'National Institute of Ophthalmology & Hospital, Sher-e-Bangla Nagar, Dhaka',
                'bio': 'Renowned ophthalmologist & micro-surgeon. Former DGHS Director General. Known for advanced cataract and vitreoretinal eye surgeries.',
                'rating': 4.88,
                'total_reviews': 142,
            },
            {
                'username': 'kamrulhasan',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Kamrul Hasan',
                'last_name': 'Tarafder',
                'email': 'kamrul.tarafder@bsmmu.edu.bd',
                'specialty': 'ENT / Otorhinolaryngology',
                'qualification': 'MBBS, FCPS (ENT), FICS, FACS (USA)',
                'experience_years': 28,
                'consultation_fee': 1200.00,
                'district': 'Dhaka',
                'hospital': 'BSMMU & Apollo/Evercare Hospital, Dhaka',
                'bio': 'Pioneer ENT and Head-Neck Surgeon in Bangladesh. Expert in endoscopic sinus surgery and cochlear implant procedures.',
                'rating': 4.89,
                'total_reviews': 165,
            },
            {
                'username': 'shahanarahman',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Shahana A.',
                'last_name': 'Rahman',
                'email': 'shahana.rahman@bsmmu.edu.bd',
                'specialty': 'Pediatrics',
                'qualification': 'MBBS, FCPS (Paediatrics), MD, FRCP (Edin)',
                'experience_years': 30,
                'consultation_fee': 1200.00,
                'district': 'Dhaka',
                'hospital': 'Department of Pediatrics, BSMMU, Dhaka',
                'bio': 'Top pediatric rheumatologist and child health specialist in Bangladesh. Extensive research in juvenile idiopathic arthritis and childhood health.',
                'rating': 4.94,
                'total_reviews': 198,
            },
            {
                'username': 'sanawarhossain',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Md. Sanawar',
                'last_name': 'Hossain',
                'email': 'sanawar.hossain@dmc.gov.bd',
                'specialty': 'Orthopedics',
                'qualification': 'MBBS, MS (Orthopaedics), Fellow Spine Surgery (Singapore)',
                'experience_years': 24,
                'consultation_fee': 1000.00,
                'district': 'Dhaka',
                'hospital': 'National Institute of Traumatology and Orthopaedic Rehabilitation (NITOR), Dhaka',
                'bio': 'Senior spine and orthopedic surgeon. Specialist in joint replacement, complex pelvic trauma, and scoliosis corrections.',
                'rating': 4.87,
                'total_reviews': 122,
            },
            {
                'username': 'fakhrulislam',
                'password': DEFAULT_PASSWORD,
                'first_name': 'M. Fakhrul',
                'last_name': 'Islam',
                'email': 'fakhrul.islam@unitedhospital.com.bd',
                'specialty': 'Cardiology',
                'qualification': 'MBBS, MD (Cardiology), FCPS, FESC',
                'experience_years': 22,
                'consultation_fee': 1400.00,
                'district': 'Dhaka',
                'hospital': 'United Hospital, Gulshan 2, Dhaka',
                'bio': 'Renowned Consultant Cardiologist with thousands of successful coronary angioplasties and pacemaker implantations.',
                'rating': 4.91,
                'total_reviews': 156,
            },
            {
                'username': 'fazlulhaque',
                'password': DEFAULT_PASSWORD,
                'first_name': 'A.K.M. Fazlul',
                'last_name': 'Haque',
                'email': 'fazlul.haque@edencolorectal.com',
                'specialty': 'General Surgery',
                'qualification': 'MBBS, FCPS (Surgery), Fellow Colorectal Surgery (Singapore)',
                'experience_years': 33,
                'consultation_fee': 1500.00,
                'district': 'Dhaka',
                'hospital': 'Eden Multicare Hospital, Dhanmondi, Dhaka',
                'bio': 'Pioneer colorectal surgeon of Bangladesh. Founder of Bangladesh Society of Colon and Rectal Surgeons.',
                'rating': 4.93,
                'total_reviews': 230,
            },

            # ─── CHITTAGONG ───
            {
                'username': 'syedkamal',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Syed Kamal',
                'last_name': 'Uddin',
                'email': 'syed.kamal@cmch.gov.bd',
                'specialty': 'Internal Medicine',
                'qualification': 'MBBS, FCPS (Medicine), MACP (USA)',
                'experience_years': 26,
                'consultation_fee': 1000.00,
                'district': 'Chittagong',
                'hospital': 'Chittagong Medical College Hospital (CMCH), KB Fazlul Kader Rd, Chattogram',
                'bio': 'Former Professor and Head of Medicine, Chittagong Medical College. Leading physician in the Chittagong Division for complex medical disorders.',
                'rating': 4.91,
                'total_reviews': 175,
            },
            {
                'username': 'tariqulislam',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Md. Tariqul',
                'last_name': 'Islam',
                'email': 'tariqul.chittagong@evercare.com.bd',
                'specialty': 'Orthopedics',
                'qualification': 'MBBS, MS (Orthopedics), AO Trauma Fellow (Switzerland)',
                'experience_years': 20,
                'consultation_fee': 1000.00,
                'district': 'Chittagong',
                'hospital': 'Evercare Hospital Chattogram, Ananna R/A, Oxygen-Kuwaish Road',
                'bio': 'Leading orthopedic and joint replacement surgeon in Chattogram. Specializes in knee and hip arthroplasty and sports injury arthroscopy.',
                'rating': 4.88,
                'total_reviews': 110,
            },
            {
                'username': 'mizanurrahman',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Mizanur',
                'last_name': 'Rahman',
                'email': 'mizanur.cardio@nationalhospitalctg.com',
                'specialty': 'Cardiology',
                'qualification': 'MBBS, MD (Cardiology), FCPS, FSCAI (USA)',
                'experience_years': 23,
                'consultation_fee': 1100.00,
                'district': 'Chittagong',
                'hospital': 'National Hospital Chittagong, Mehdibag, Chattogram',
                'bio': 'Senior Consultant Interventional Cardiologist. Expert in coronary angiography, complex angioplasty, and cardiac stenting in Chattogram.',
                'rating': 4.89,
                'total_reviews': 145,
            },

            # ─── SYLHET ───
            {
                'username': 'anamulhaque',
                'password': DEFAULT_PASSWORD,
                'first_name': 'M. A. Anamul',
                'last_name': 'Haque',
                'email': 'anamul.haque@magosmani.gov.bd',
                'specialty': 'Neurology',
                'qualification': 'MBBS, MD (Neurology), MACP',
                'experience_years': 22,
                'consultation_fee': 900.00,
                'district': 'Sylhet',
                'hospital': 'Sylhet MAG Osmani Medical College Hospital, Medical Road, Sylhet',
                'bio': 'Chief of Neurology, MAG Osmani Medical College. Leading neurologist in Greater Sylhet for stroke, epilepsy, and peripheral neuropathy.',
                'rating': 4.90,
                'total_reviews': 130,
            },
            {
                'username': 'ashrafulalam',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Md. Ashraful',
                'last_name': 'Alam',
                'email': 'ashraful.alam@noorjahanhospital.com',
                'specialty': 'Pediatrics',
                'qualification': 'MBBS, DCH, FCPS (Pediatrics), MRCPCH (UK)',
                'experience_years': 19,
                'consultation_fee': 800.00,
                'district': 'Sylhet',
                'hospital': 'Noorjahan Hospital & Research Centre, Dargah Gate, Sylhet',
                'bio': 'Top child health specialist and neonatologist serving Sylhet and expatriate families. Expert in newborn intensive care and pediatric respiratory care.',
                'rating': 4.86,
                'total_reviews': 95,
            },

            # ─── RAJSHAHI ───
            {
                'username': 'moniruzzaman',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Md. Moniruzzaman',
                'last_name': 'Khan',
                'email': 'moniruzzaman.khan@rmc.gov.bd',
                'specialty': 'Cardiology',
                'qualification': 'MBBS, MD (Cardiology), FCPS',
                'experience_years': 25,
                'consultation_fee': 800.00,
                'district': 'Rajshahi',
                'hospital': 'Rajshahi Medical College Hospital (RMCH), Laxmipur, Rajshahi',
                'bio': 'Head of Cardiology at RMCH. Renowned cardiologist in North Bengal with over 25 years of experience in heart disease management and CCU care.',
                'rating': 4.89,
                'total_reviews': 160,
            },
            {
                'username': 'mujiburrahman',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Md. Mujibur',
                'last_name': 'Rahman',
                'email': 'mujibur.gastro@royalhospitalbd.com',
                'specialty': 'Gastroenterology',
                'qualification': 'MBBS, MD (Gastroenterology), FCPS',
                'experience_years': 21,
                'consultation_fee': 800.00,
                'district': 'Rajshahi',
                'hospital': 'Royal Hospital & Diagnostic Center, Kazihata, Rajshahi',
                'bio': 'Senior Consultant in digestive disease, liver disorders, therapeutic endoscopy, and colonoscopy in Rajshahi Division.',
                'rating': 4.84,
                'total_reviews': 88,
            },

            # ─── KHULNA ───
            {
                'username': 'aniskhan',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Md. Anisur',
                'last_name': 'Rahman Khan',
                'email': 'anisur.khan@kmch.gov.bd',
                'specialty': 'Orthopedics',
                'qualification': 'MBBS, MS (Orthopedics), Fellow Trauma & Arthroscopy',
                'experience_years': 24,
                'consultation_fee': 800.00,
                'district': 'Khulna',
                'hospital': 'Khulna Medical College Hospital (KMCH), Boyra, Khulna',
                'bio': 'Head of Orthopedic Surgery at KMCH. Top bone and joint specialist in the South-Western region of Bangladesh.',
                'rating': 4.87,
                'total_reviews': 120,
            },
            {
                'username': 'abdulmomen',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Abdul',
                'last_name': 'Momen',
                'email': 'abdul.momen@gazi-medical.com',
                'specialty': 'Internal Medicine',
                'qualification': 'MBBS, FCPS (Medicine), DTCD',
                'experience_years': 27,
                'consultation_fee': 800.00,
                'district': 'Khulna',
                'hospital': 'Gazi Medical College Hospital, Sonadanga, Khulna',
                'bio': 'Senior Medicine Specialist and Chest Physician. Known for treating chronic pulmonary diseases, diabetes, and infectious fever.',
                'rating': 4.85,
                'total_reviews': 104,
            },

            # ─── MYMENSINGH ───
            {
                'username': 'mostafizurrahman',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Md. Mostafizur',
                'last_name': 'Rahman',
                'email': 'mostafiz.neuro@mmch.gov.bd',
                'specialty': 'Neurology',
                'qualification': 'MBBS, MD (Neurology), PhD',
                'experience_years': 23,
                'consultation_fee': 700.00,
                'district': 'Mymensingh',
                'hospital': 'Mymensingh Medical College Hospital (MMCH), Charpara, Mymensingh',
                'bio': 'Head of Neurology Department, MMCH. Leading authority in North-Central Bangladesh for stroke, movement disorders, and paralysis rehabilitation.',
                'rating': 4.88,
                'total_reviews': 118,
            },

            # ─── BARISAL ───
            {
                'username': 'hasanuzzaman',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Md. Hasanuzzaman',
                'last_name': 'Chowdhury',
                'email': 'hasanuzzaman@sbmch.gov.bd',
                'specialty': 'Cardiology',
                'qualification': 'MBBS, MD (Cardiology), FCPS',
                'experience_years': 20,
                'consultation_fee': 700.00,
                'district': 'Barisal',
                'hospital': 'Sher-e-Bangla Medical College Hospital (SBMCH), Band Road, Barisal',
                'bio': 'Chief of Cardiology, SBMCH. Renowned heart specialist catering to patients across the entire coastal division of Barisal.',
                'rating': 4.86,
                'total_reviews': 92,
            },

            # ─── COMILLA ───
            {
                'username': 'sirajulhossain',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Md. Sirajul',
                'last_name': 'Hossain',
                'email': 'sirajul.hossain@comillamc.gov.bd',
                'specialty': 'Dermatology',
                'qualification': 'MBBS, DDV, FCPS (Dermatology & Venereology)',
                'experience_years': 18,
                'consultation_fee': 700.00,
                'district': 'Comilla',
                'hospital': 'Comilla Medical College Hospital, Kuchaitoli, Cumilla',
                'bio': 'Top skin and venereal disease specialist in Cumilla. Expert in laser cosmetology, chronic eczema, psoriasis, and pediatric dermatology.',
                'rating': 4.83,
                'total_reviews': 76,
            },
            {
                'username': 'delwarhossain',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Md. Delwar',
                'last_name': 'Hossain',
                'email': 'delwar.comilla@moonhospital.com',
                'specialty': 'Internal Medicine',
                'qualification': 'MBBS, FCPS (Medicine), MACP',
                'experience_years': 22,
                'consultation_fee': 800.00,
                'district': 'Comilla',
                'hospital': 'Moon Hospital Complex, Jhawtala, Cumilla',
                'bio': 'Senior Consultant Physician. Widely sought after in Cumilla and Brahmanbaria for diagnostic evaluation and chronic fever treatment.',
                'rating': 4.87,
                'total_reviews': 112,
            },

            # ─── RANGPUR ───
            {
                'username': 'rashedulhasan',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Md. Rashedul',
                'last_name': 'Hasan',
                'email': 'rashedul.ped@rmch.gov.bd',
                'specialty': 'Pediatrics',
                'qualification': 'MBBS, DCH, MD (Pediatrics)',
                'experience_years': 19,
                'consultation_fee': 600.00,
                'district': 'Rangpur',
                'hospital': 'Rangpur Medical College Hospital (RpMCH), Jail Road, Rangpur',
                'bio': 'Leading child specialist in Rangpur Division. Dedication to child nutrition, pediatric infections, and newborn critical care.',
                'rating': 4.85,
                'total_reviews': 89,
            },

            # ─── JASHORE ───
            {
                'username': 'asaduzzaman',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Md. Asaduzzaman',
                'last_name': 'Biswas',
                'email': 'asaduzzaman@jashore-general.gov.bd',
                'specialty': 'General Surgery',
                'qualification': 'MBBS, FCPS (Surgery), FMAS (Laparoscopy)',
                'experience_years': 22,
                'consultation_fee': 700.00,
                'district': 'Jashore',
                'hospital': '250 Bed General Hospital, Hospital Road, Jashore',
                'bio': 'Senior Consultant Surgeon and Laparoscopic Specialist. Over 20 years of surgical excellence in gallbladder, hernia, and appendix surgeries in Jashore.',
                'rating': 4.88,
                'total_reviews': 105,
            },
            {
                'username': 'khalidhasan',
                'password': DEFAULT_PASSWORD,
                'first_name': 'Md. Khalid',
                'last_name': 'Hasan',
                'email': 'khalid.hasan@jmc.gov.bd',
                'specialty': 'Internal Medicine',
                'qualification': 'MBBS, FCPS (Medicine), MD',
                'experience_years': 17,
                'consultation_fee': 700.00,
                'district': 'Jashore',
                'hospital': 'Jashore Medical College Hospital & Queen\'s Hospital, Jail Road, Jashore',
                'bio': 'Associate Professor of Medicine at Jashore Medical College. Specialist in diabetes, hypertension, tropical diseases, and geriatric medicine.',
                'rating': 4.86,
                'total_reviews': 94,
            },
        ]

        created_doctors = []
        for d in doctors_data:
            user = User.objects.create_user(
                username=d['username'],
                password=d['password'],
                email=d['email'],
                first_name=d['first_name'],
                last_name=d['last_name'],
                role='DOCTOR',
                phone='+880 1712-000000',
            )
            doc_profile = DoctorProfile.objects.create(
                user=user,
                specialty=d['specialty'],
                qualification=d['qualification'],
                experience_years=d['experience_years'],
                consultation_fee=d['consultation_fee'],
                district=d['district'],
                hospital=d['hospital'],
                bio=d['bio'],
                rating=d['rating'],
                total_reviews=d['total_reviews'],
            )
            created_doctors.append(doc_profile)

        self.stdout.write(f"Created {len(created_doctors)} Bangladeshi doctor profiles.")

        # Create Availability Slots for all doctors
        self.stdout.write("Creating availability slots (Evening chamber hours)...")
        today = date.today()
        evening_times = [
            (time(16, 0), time(16, 30)),
            (time(16, 30), time(17, 0)),
            (time(17, 0), time(17, 30)),
            (time(17, 30), time(18, 0)),
            (time(18, 0), time(18, 30)),
            (time(18, 30), time(19, 0)),
            (time(19, 0), time(19, 30)),
            (time(19, 30), time(20, 0)),
        ]

        slot_objects = []
        for doc in created_doctors:
            for day_offset in range(0, 6):
                slot_date = today + timedelta(days=day_offset)
                for start_t, end_t in evening_times:
                    slot = AvailabilitySlot.objects.create(
                        doctor=doc,
                        date=slot_date,
                        start_time=start_t,
                        end_time=end_t,
                        is_booked=False
                    )
                    slot_objects.append(slot)

        self.stdout.write("Creating realistic demo appointments, prescriptions, and reviews...")
        # 1. Rahim Uddin appointments
        # Appt 1: Completed with Prof. Dr. ABM Abdullah + full Prescription
        doc_abdullah = created_doctors[0]
        s1 = AvailabilitySlot.objects.filter(doctor=doc_abdullah).first()
        if s1:
            s1.is_booked = True
            s1.save()
        app1 = Appointment.objects.create(
            patient=patient_rahim,
            doctor=doc_abdullah,
            slot=s1,
            date=today - timedelta(days=4),
            time_slot='04:00 PM - 04:30 PM',
            symptoms='High blood pressure, severe morning headaches, fatigue and occasional dizziness.',
            patient_notes='History of high blood pressure for 2 years. Non-smoker.',
            status='COMPLETED'
        )
        Prescription.objects.create(
            appointment=app1,
            diagnosis='Essential Hypertension Stage-2 with Mild Anxiety',
            medications=(
                '1. Tab. Amlodipine 5mg (Amlocard) — 1+0+0 (After breakfast, 30 days)\n'
                '2. Tab. Losartan Potassium 50mg (Osartil) — 1+0+0 (After breakfast, 30 days)\n'
                '3. Tab. Pantoprazole 20mg (Pantodac) — 1+0+1 (Before meals, 14 days)\n'
                '4. Cap. Neuro-B (Vitamin B1+B6+B12) — 0+1+0 (After lunch, 30 days)\n'
                '5. Tab. Clonazepam 0.5mg (Rivotril) — 0+0+1/2 (At bedtime if needed for sleep, 7 days)'
            ),
            advice='1. Strictly maintain low salt diet (< 5g per day).\n2. 30 minutes brisk walking daily in the morning.\n3. Measure and record blood pressure daily at 10 AM.\n4. Avoid excess caffeine and mental stress.',
            follow_up_date=today + timedelta(days=26)
        )
        Review.objects.create(
            patient=patient_rahim,
            doctor=doc_abdullah,
            rating=5,
            comment='Prof. Dr. ABM Abdullah is the pride of Bangladesh! Extremely kind, listened attentively, and within 3 days my blood pressure returned to normal.'
        )

        # Appt 2: Confirmed with Prof. Dr. Mustafa Zaman (Cardiology)
        doc_mustafa = created_doctors[1]
        s2 = AvailabilitySlot.objects.filter(doctor=doc_mustafa, date=today + timedelta(days=1)).first()
        if s2:
            s2.is_booked = True
            s2.save()
        Appointment.objects.create(
            patient=patient_rahim,
            doctor=doc_mustafa,
            slot=s2,
            date=today + timedelta(days=1),
            time_slot='05:00 PM - 05:30 PM',
            symptoms='Mild chest discomfort on brisk walking, routine cardiac follow-up.',
            patient_notes='Carrying recent Lipid Profile and ECG report.',
            status='CONFIRMED'
        )

        # Appt 3: Pending with Prof. Dr. Deen Mohd (Eye)
        doc_deen = created_doctors[3]
        s3 = AvailabilitySlot.objects.filter(doctor=doc_deen, date=today + timedelta(days=2)).first()
        if s3:
            s3.is_booked = True
            s3.save()
        Appointment.objects.create(
            patient=patient_rahim,
            doctor=doc_deen,
            slot=s3,
            date=today + timedelta(days=2),
            time_slot='06:00 PM - 06:30 PM',
            symptoms='Blurry vision in left eye and eye dryness while using laptop.',
            patient_notes='Looking for refraction check and reading glasses prescription.',
            status='PENDING'
        )

        # Appt 4: Cancelled appointment with Dr. Khalid Hasan
        doc_khalid = created_doctors[-1]
        Appointment.objects.create(
            patient=patient_rahim,
            doctor=doc_khalid,
            slot=None,
            date=today - timedelta(days=10),
            time_slot='07:00 PM - 07:30 PM',
            symptoms='Seasonal viral fever and throat ache.',
            patient_notes='Cancelled because patient recovered before visit.',
            status='CANCELLED'
        )

        # 2. Fatema Begum appointments
        # Appt 5: Pending with Dr. Mustafa Zaman
        s5 = AvailabilitySlot.objects.filter(doctor=doc_mustafa, date=today).first()
        if s5:
            s5.is_booked = True
            s5.save()
        Appointment.objects.create(
            patient=patient_fatema,
            doctor=doc_mustafa,
            slot=s5,
            date=today,
            time_slot='06:30 PM - 07:00 PM',
            symptoms='Palpitations and shortness of breath when climbing stairs.',
            patient_notes='Blood pressure currently 135/85. Fasting sugar 5.6.',
            status='PENDING'
        )

        # Appt 6: Completed with Prof. Dr. Shahana A. Rahman (Pediatrics) + Prescription
        doc_shahana = created_doctors[5]
        s6 = AvailabilitySlot.objects.filter(doctor=doc_shahana).first()
        if s6:
            s6.is_booked = True
            s6.save()
        app6 = Appointment.objects.create(
            patient=patient_fatema,
            doctor=doc_shahana,
            slot=s6,
            date=today - timedelta(days=7),
            time_slot='05:30 PM - 06:00 PM',
            symptoms='Consultation for 6-year-old child: persistent dry cough, wheezing during night.',
            patient_notes='Allergic to dust and cold air.',
            status='COMPLETED'
        )
        Prescription.objects.create(
            appointment=app6,
            diagnosis='Childhood Bronchial Asthma (Mild Persistent) with Allergic Rhinitis',
            medications=(
                '1. Inhaler Salbutamol 100mcg (Ventolin) — 2 puffs with spacer as needed for wheeze\n'
                '2. Inhaler Fluticasone 50mcg (Flixonase) — 1 puff twice daily (1 month)\n'
                '3. Syp. Montelukast 4mg (Montene) — 1 teaspoon once daily at night (30 days)\n'
                '4. Syp. Fexofenadine (Fexo 30mg) — 1 teaspoon twice daily (7 days)'
            ),
            advice='1. Avoid dust, smoke, mosquito coils, and cold drinks.\n2. Keep bedroom well-ventilated.\n3. Rinse mouth with water after inhaler use.\n4. Use spacer device properly.',
            follow_up_date=today + timedelta(days=21)
        )
        Review.objects.create(
            patient=patient_fatema,
            doctor=doc_shahana,
            rating=5,
            comment='Dr. Shahana is amazing with kids! My child is breathing comfortably now and sleeping peacefully. Very thorough examination.'
        )

        # 3. Tanvir Ahmed appointment
        # Appt 7: Completed with Prof. Dr. Kamrul Hasan Tarafder (ENT)
        doc_kamrul = created_doctors[4]
        s7 = AvailabilitySlot.objects.filter(doctor=doc_kamrul).first()
        if s7:
            s7.is_booked = True
            s7.save()
        app7 = Appointment.objects.create(
            patient=patient_tanvir,
            doctor=doc_kamrul,
            slot=s7,
            date=today - timedelta(days=2),
            time_slot='04:30 PM - 05:00 PM',
            symptoms='Chronic nasal congestion, facial pain around maxillary sinuses, headache.',
            patient_notes='Sinus X-ray taken yesterday.',
            status='COMPLETED'
        )
        Prescription.objects.create(
            appointment=app7,
            diagnosis='Chronic Maxillary Sinusitis with Deviated Nasal Septum (DNS)',
            medications=(
                '1. Tab. Cefuroxime Axetil 500mg (Ceftron) — 1+0+1 (After meals, 10 days)\n'
                '2. Nasal Spray Fluticasone Furoate (Avamys) — 2 sprays each nostril once daily (30 days)\n'
                '3. Tab. Bilastine 20mg (Bilaxten) — 1+0+0 (1 hour before breakfast, 14 days)\n'
                '4. Normal Saline Nasal Wash — 2 times daily'
            ),
            advice='1. Warm steam inhalation 10 minutes twice daily.\n2. Avoid direct air conditioner blast.\n3. Drink plenty of warm water.',
            follow_up_date=today + timedelta(days=12)
        )
        Review.objects.create(
            patient=patient_tanvir,
            doctor=doc_kamrul,
            rating=5,
            comment='Prof. Kamrul Hasan diagnosed my sinus problem immediately. The nasal spray and medications provided huge relief within 24 hours.'
        )

        self.stdout.write(self.style.SUCCESS(
            f"\n AmarDoctor database successfully seeded!\n"
            f"• 25 Famous Bangladeshi Doctors across 10 districts\n"
            f"• 4 Demo Patients (rahimuddin, fatemabegum, tanvirahmed, nusratjahan)\n"
            f"• 1 System Admin (admin)\n"
            f"• All user passwords: {DEFAULT_PASSWORD}\n"
            f"• Live appointments with PENDING, CONFIRMED, COMPLETED (with Prescriptions) and CANCELLED tasks."
        ))
