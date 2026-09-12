from typing import Any
from pydantic import BaseModel
class Success(BaseModel): success:bool=True; data:Any=None; message:str|None=None
class Failure(BaseModel): success:bool=False; data:None=None; message:str; code:str

