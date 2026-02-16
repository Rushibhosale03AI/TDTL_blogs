from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.core.files.storage import default_storage
from .models import Post
from .serializers import PostSerializer
from .permissions import IsOwnerOrReadOnly

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def create(self, request, *args, **kwargs):
        # 1. Make a copy of the incoming data so we can modify it
        data = request.data.copy()

        # 2. Check if the user uploaded a file in the 'content' field
        if 'content' in request.FILES:
            uploaded_file = request.FILES['content']
            
            # 3. Manually save the file into the media/blog_files folder
            file_name = default_storage.save(f'blog_files/{uploaded_file.name}', uploaded_file)
            file_url = default_storage.url(file_name)
            
            # 4. Replace the file object with the text path string
            data['content'] = f"File attached: http://127.0.0.1:8000{file_url}"

        # 5. Pass the modified text data to the serializer
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)