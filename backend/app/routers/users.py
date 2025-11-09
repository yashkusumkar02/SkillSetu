from fastapi import APIRouter, Depends
from ..routers._auth_utils import get_current_user
from ..schemas import UserOut

router = APIRouter()

@router.get("/me", response_model=UserOut)
def me(user = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "name": user.name}
