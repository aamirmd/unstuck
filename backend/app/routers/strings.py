from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class StringInput(BaseModel):
    text: str


class StringOutput(BaseModel):
    result: str


@router.post("/append-dooly")
async def append_dooly(input_data: StringInput) -> StringOutput:
    result = input_data.text + "dooly"
    return StringOutput(result=result)
