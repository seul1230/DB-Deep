from fastapi import APIRouter, Request, HTTPException
from api.dto.glossary import SaveGlossaryTermListRequest
from service.glossary_service import save_glossary_terms_batch

router = APIRouter()

@router.post("/api/glossary")
def create_glossary_terms(request: Request, body: SaveGlossaryTermListRequest):
    try:
        member_id = request.state.member_id
        print(member_id)
        term_dicts = [term.dict() for term in body.terms]
        save_glossary_terms_batch(member_id, term_dicts)
        return {"message": f"{len(term_dicts)}개의 용어가 저장되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
