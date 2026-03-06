from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.core.files.storage import default_storage
from django.http import Http404
from django.db.models import Q
from .models import Post
from .serializers import PostSerializer
from .permissions import IsOwnerOrReadOnly

# 1. IMPORT THE CACHE
from django.core.cache import cache     

class PostListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, format=None):
        # 2. CREATE A UNIQUE CACHE KEY (Combines Page Number and Search Query)
        page = request.query_params.get('page', 1)
        search = request.query_params.get('search', '')
        cache_key = f"blogs_page_{page}_search_{search}"

        # 3. ASK THE CACHE FOR THE DATA
        cached_data = cache.get(cache_key)

        if cached_data:
            # If it exists, skip MySQL completely!
            print(f"🚀 FAST LOAD: Serving {cache_key} from RAM Cache!")
            return Response(cached_data)

        # 4. IF CACHE IS EMPTY, DO THE HEAVY LIFTING
        print(f"🐢 SLOW LOAD: Fetching {cache_key} from MySQL Database!")
        posts = Post.objects.filter(is_deleted=False).order_by('-created_at')
        
        # Manual implementation of SearchFilter
        if search:
            posts = posts.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search) |
                Q(author__username__icontains=search)
            )
            
        paginator = PageNumberPagination()
        paginator.page_size = 5 # Set how many blogs show up per page!

        paginated_posts = paginator.paginate_queryset(posts, request)
        serializer = PostSerializer(paginated_posts, many=True)
        
        # Generate the final dictionary with the 'next' links and 'results'
        final_response_data = paginator.get_paginated_response(serializer.data).data

        # 5. SAVE THE RESULT TO THE CACHE FOR 5 MINUTES (300 seconds)
        cache.set(cache_key, final_response_data, timeout=300)

        return Response(final_response_data)

    def post(self, request, format=None):
        data = request.data.copy()

        # Handle custom file uploads
        if 'content' in request.FILES:
            uploaded_file = request.FILES['content']
            file_name = default_storage.save(f'blog_files/{uploaded_file.name}', uploaded_file)
            file_url = default_storage.url(file_name)
            data['content'] = f"File attached: http://127.0.0.1:8000{file_url}"

        serializer = PostSerializer(data=data)
        if serializer.is_valid():
            # Save the post and link it to the currently logged-in user
            serializer.save(author=request.user)
            
            # CACHE INVALIDATION: Wipe the cache so the new post appears immediately!
            print("🧹 NEW POST CREATED: Wiping the cache to keep data fresh!")
            cache.clear()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------------------------------------------------------
# 2. Handles GET (Retrieve one), PUT (Edit), and DELETE (Soft Delete)
# URL: /api/posts/<id>/
# ---------------------------------------------------------
class PostDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_object(self, pk):
        try:
            post = Post.objects.get(pk=pk, is_deleted=False)
            self.check_object_permissions(self.request, post) 
            return post
        except Post.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        post = self.get_object(pk)
        serializer = PostSerializer(post)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        post = self.get_object(pk)
        serializer = PostSerializer(post, data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            # CACHE INVALIDATION: Wipe cache so the edited post reflects instantly!
            print("🧹 POST EDITED: Wiping the cache to keep data fresh!")
            cache.clear()
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        post = self.get_object(pk)
        
        # Soft Delete Logic
        post.is_deleted = True
        post.save()
        
        # CACHE INVALIDATION: Wipe cache so the deleted post disappears instantly!
        print("🧹 POST DELETED: Wiping the cache to keep data fresh!")
        cache.clear()
        
        return Response(status=status.HTTP_204_NO_CONTENT)