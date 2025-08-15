import io
import json
from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch
from docx import Document # pyright: ignore[reportMissingImports]
from hello.views import generate_docs

# Create your tests here.


# Note: The tests below rely upon static assets (for the rendered templates), so require that either:
# 1. The static assets have been processed - ie: `./manage.py collectstatic` has been run.
# 2. Or, the tests are run in debug mode (which means WhiteNoise will use auto-refresh mode),
#    using: `./manage.py test --debug-mode`
class ExampleTest(TestCase):
    def test_index_page(self):
        response = self.client.get("/")
        self.assertContains(
            response, "Getting Started with Python on Heroku", status_code=200
        )

    def test_db_page(self):
        # Each time the page is requested, the number of recorded greetings increases.

        first_response = self.client.get("/db/")
        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(len(first_response.context["greetings"]), 1)

        second_response = self.client.get("/db/")
        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(len(second_response.context["greetings"]), 2)



class GenerateDocsTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('generate_docs')
        self.payload = {
            "first_name": "cc",
            "last_name": "cc",
            "email": "cc@mail.com",
            "phone": "545",
            "address_line_1": "455",
            "address_line_2": "",
            "city": "546",
            "state": "56",
            "zip": "6556",
            "county": "556",
            "last_four": "665",
            "sex": "MALE",
            "poa_agent_1_full_name": "cc",
            "poa_agent_1_phone": "cc",
            "poa_agent_1_address_1": "cc",
            "poa_agent_1_address_2": "cc",
            "poa_agent_1_city": "cc",
            "poa_agent_1_state": "cc",
            "poa_agent_1_zip": "cc",
            "poa_agent_1_county": "ccc",
            "poa_agent_2_full_name": "ccc",
            "poa_agent_2_phone": "ccc",
            "poa_agent_2_address_1": "ccc",
            "poa_agent_2_address_2": "c",
            "poa_agent_2_city": "ccc",
            "poa_agent_2_state": "ccc",
            "poa_agent_2_zip": "ccc",
            "poa_agent_2_county": "ccc",
            "testator_testatrix": "Testator",
            "father_mother": "Father",
            "pronoun_subject": "He",
            "pronoun_object": "Him",
            "pronoun_possessive": "His",
            "CHILDREN": "",
            "date": "2025-08-15",
            "day": "15",
            "month": "August",
            "year": "2025",
            "document_types": ["poa"]
        }

    @patch('django.core.mail.EmailMessage.send')
    def test_generate_docs_poa(self, mock_email_send):
        # Simulate POST request
        response = self.client.post(
            self.url,
            data=json.dumps(self.payload),
            content_type='application/json'
        )

        # Check response
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data.get('success'))
        self.assertIn('Document POA_CC_CC_', response_data.get('html'))
        self.assertIn('sent to cc@mail.com', response_data.get('html'))

        # Verify email was prepared
        self.assertTrue(mock_email_send.called)
        email_call = mock_email_send.call_args
        email = email_call[0][0]  # EmailMessage object
        self.assertEqual(email.subject, "CC CC's Generated Documents")
        self.assertEqual(email.to, ['cc@mail.com'])
        self.assertEqual(len(email.attachments), 1)
        attachment = email.attachments[0]
        self.assertTrue(attachment[0].startswith('POA_CC_CC_'))
        self.assertEqual(attachment[2], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

        # Verify attachment content
        buffer = io.BytesIO(attachment[1])
        doc = Document(buffer)
        doc_text = ' '.join([para.text for para in doc.paragraphs])
        self.assertIn('CC CC', doc_text)  # Check principal's full name
        self.assertIn('546, 56 6556', doc_text)  # Check address
        self.assertIn('15', doc_text)  # Check day
        self.assertIn('August', doc_text)  # Check month
        self.assertIn('2025', doc_text)  # Check year

    def test_generate_docs_invalid_method(self):
        # Test non-POST request
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {'error': 'Invalid method'})

    def test_generate_docs_missing_email(self):
        payload = self.payload.copy()
        del payload['email']
        response = self.client.post(
            self.url,
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {'error': 'Email address is required'})