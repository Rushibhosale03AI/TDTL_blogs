from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

class AccountTests(APITestCase):
    def test_user_registration(self):
        """Ensure we can create a new user account via API [cite: 28]"""
        url = reverse('register')
        data = {
            'username': 'rushikesh_b',
            'email': 'rushi@example.com',
            'password': 'securepassword123'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)