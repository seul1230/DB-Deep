from fastapi import APIRouter, Request, HTTPException
from api.dto.glossary import (
    SaveGlossaryTermListRequest,
    UpdateGlossaryTermRequest
)
from services.glossary_service import (
    save_glossary_terms_batch,
    get_glossary_terms_by_member_id,
    update_glossary_term,
    delete_glossary_term
)

router = APIRouter()

@router.post("/api/glossary")
def create_glossary_terms(request: Request, body: SaveGlossaryTermListRequest):
    try:
        member_id = request.state.member_id
        term_dicts = [term.dict() for term in body.terms]
        save_glossary_terms_batch(member_id, term_dicts)
        return {"message": f"{len(term_dicts)}개의 용어가 저장되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/glossary")
def get_glossary_terms(request: Request):
    try:
        member_id = request.state.member_id
        terms = get_glossary_terms_by_member_id(member_id)
        return terms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/api/glossary/{term_id}")
def update_glossary(request: Request, term_id: str, body: UpdateGlossaryTermRequest):
    try:
        member_id = request.state.member_id
        update_glossary_term(member_id, term_id, body.key, body.value)
        return {"message": "수정되었습니다"}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/api/glossary/{term_id}")
def delete_glossary(request: Request, term_id: str):
    try:
        member_id = request.state.member_id
        delete_glossary_term(member_id, term_id)
        return {"message": "삭제되었습니다"}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))