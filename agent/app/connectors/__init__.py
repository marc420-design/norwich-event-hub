from app.connectors.base import BaseConnector
from app.connectors.html_connector import HTMLConnector
from app.connectors.ics_connector import ICSConnector
from app.connectors.api_connector import SkiddleConnector, EventbriteConnector
from app.connectors.operator_connector import OperatorConnector

CONNECTOR_MAP = {
    "html": HTMLConnector,
    "ics": ICSConnector,
    "operator": OperatorConnector,
}


def get_connector(connector_type: str, source_id: str, url: str, name: str = "") -> BaseConnector:
    cls = CONNECTOR_MAP.get(connector_type, HTMLConnector)
    return cls(source_id=source_id, url=url, name=name)
