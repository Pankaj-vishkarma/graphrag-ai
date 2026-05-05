from django.db import models
from django.contrib.auth.models import User


# =========================
# DOCUMENT MODEL
# =========================
class Document(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # 🔥 ADD THIS

    name = models.CharField(max_length=255)
    file = models.FileField(upload_to="documents/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(max_length=50, default="uploaded")
    entity_count = models.IntegerField(default=0)
    relationship_count = models.IntegerField(default=0)

    def __str__(self):
        return self.name


# =========================
# QUERY MODEL
# =========================
class Query(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # 🔥 ADD THIS

    query_text = models.TextField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    graph_answer = models.TextField(blank=True, null=True)
    vector_answer = models.TextField(blank=True, null=True)
    hybrid_answer = models.TextField(blank=True, null=True)

    response_time = models.FloatField(blank=True, null=True)

    def __str__(self):
        return self.query_text[:50]


# =========================
# EVALUATION MODEL
# =========================
class Evaluation(models.Model):

    METHOD_CHOICES = [
        ("graph", "Graph"),
        ("vector", "Vector"),
        ("hybrid", "Hybrid"),
    ]

    # One evaluation per query
    query = models.OneToOneField(Query, on_delete=models.CASCADE)

    best_method = models.CharField(
        max_length=20,
        choices=METHOD_CHOICES
    )

    graph_score = models.FloatField(default=0)
    vector_score = models.FloatField(default=0)
    hybrid_score = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evaluation {self.query.id} - {self.best_method}"