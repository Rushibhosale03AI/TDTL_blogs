# posts/urls.py
from django.urls import path
from .views import PostListCreateAPIView, PostDetailAPIView

# (Removed the unused DefaultRouter import to keep your code clean)

urlpatterns = [
    # URL Math: 'api/' (from main) + 'posts/' (from here) = '/api/posts/'
    path('posts/', PostListCreateAPIView.as_view(), name='post-list-create'),
    
    # URL Math: 'api/' (from main) + 'posts/<int:pk>/' (from here) = '/api/posts/1/'
    path('posts/<int:pk>/', PostDetailAPIView.as_view(), name='post-detail'),
]