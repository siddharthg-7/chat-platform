from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.accounts.models import Profile


class Command(BaseCommand):
    help = 'Creates two demo test users (alice / bob) with demo data for local development.'

    def handle(self, *args, **kwargs):
        users_data = [
            {
                'username': 'alice',
                'password': 'demo1234',
                'email': 'alice@demo.com',
                'first_name': 'Alice',
                'last_name': 'Johnson',
                'bio': 'Hey there! I am using Creovators Chat.',
            },
            {
                'username': 'bob',
                'password': 'demo1234',
                'email': 'bob@demo.com',
                'first_name': 'Bob',
                'last_name': 'Smith',
                'bio': 'Always online and ready to chat.',
            },
        ]

        for data in users_data:
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults={
                    'email': data['email'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                }
            )
            if created:
                user.set_password(data['password'])
                user.save()
                self.stdout.write(self.style.SUCCESS("[OK] Created user: " + data['username']))
            else:
                self.stdout.write(self.style.WARNING("[--] User already exists: " + data['username']))

            profile, _ = Profile.objects.get_or_create(user=user)
            profile.bio = data['bio']
            profile.is_online = False
            profile.save()

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('--------------------------------------------------'))
        self.stdout.write(self.style.SUCCESS('  Demo users ready!'))
        self.stdout.write(self.style.SUCCESS('--------------------------------------------------'))
        self.stdout.write(self.style.SUCCESS('  Username : alice     Password: demo1234'))
        self.stdout.write(self.style.SUCCESS('  Username : bob       Password: demo1234'))
        self.stdout.write(self.style.SUCCESS('--------------------------------------------------'))
