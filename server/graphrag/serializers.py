from rest_framework import serializers
from .models import Document, Query, Evaluation


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"


class QuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Query
        fields = "__all__"


class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = "__all__"
