from typing import Generic, TypeVar, List
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class APIBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(APIBase, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    pages: int
