from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    # We display the author's username instead of just their ID for better readability
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author_username', 'created_at', 'updated_at']
        read_only_fields = ['author_username']