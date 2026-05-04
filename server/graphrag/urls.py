from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView

from .views import (
    register,
    get_evaluations,
    query_view,
    graph_only_query,
    vector_only_query,
    compare_query,
    upload_document,
    list_documents,
    delete_document,
    get_graph,
    get_entity,
    get_path,
    run_cypher,
    graph_stats,
    get_communities,
    search_entities,
    health_check,
)

urlpatterns = [
    # =========================
    # AUTH APIs
    # =========================
    path("auth/register/", register),
    path("auth/login/", TokenObtainPairView.as_view()),
    # =========================
    # QUERY APIs
    # =========================
    path("query/", query_view),
    path("query/graph-only/", graph_only_query),
    path("query/vector-only/", vector_only_query),
    path("query/compare/", compare_query),
    # =========================
    # DOCUMENT APIs
    # =========================
    path("documents/upload/", upload_document),
    path("documents/", list_documents),
    path("documents/<int:doc_id>/", delete_document),
    # =========================
    # GRAPH APIs
    # =========================
    path("graph/", get_graph),
    path("graph/entity/<str:name>/", get_entity),
    path("graph/path/", get_path),
    path("graph/cypher/", run_cypher),
    path("graph/stats/", graph_stats),
    path("graph/communities/", get_communities),
    path("graph/search/", search_entities),
    path("evaluation/", get_evaluations),
    # =========================
    # SYSTEM
    # =========================
    path("health/", health_check),
]
