from dataclasses import dataclass
from typing import Optional

@dataclass
class WSMessagePayload:
    action: str
    conversation_id: Optional[int] = None
    text: Optional[str] = None
    temp_id: Optional[str] = None
    reply_to_id: Optional[int] = None
    voice_note: Optional[str] = None
    client_id: Optional[str] = None
    message_id: Optional[int] = None
    emoji: Optional[str] = None
    delete_type: Optional[str] = None  # 'me' or 'everyone'

    @classmethod
    def from_dict(cls, data: dict) -> 'WSMessagePayload':
        return cls(
            action=data.get('action', ''),
            conversation_id=data.get('conversation_id'),
            text=data.get('text'),
            temp_id=data.get('temp_id'),
            reply_to_id=data.get('reply_to_id'),
            voice_note=data.get('voice_note'),
            client_id=data.get('client_id'),
            message_id=data.get('message_id'),
            emoji=data.get('emoji'),
            delete_type=data.get('delete_type'),
        )
