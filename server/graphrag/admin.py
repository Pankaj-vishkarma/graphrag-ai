from django.contrib import admin
from .models import Document, Query, Evaluation


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "status",
        "entity_count",
        "relationship_count",
        "uploaded_at",
    )


@admin.register(Query)
class QueryAdmin(admin.ModelAdmin):
    list_display = ("id", "query_text", "created_at", "response_time")


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ("id", "query", "best_method", "created_at")
