import requests
from bs4 import BeautifulSoup

def scrape_url(url: str) -> str:
    """
    Descarga el contenido HTML de una URL y extrae el texto limpio del cuerpo.
    """
    try:
        # Enviar petición GET con cabecera User-Agent común para evitar bloqueos
        response = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Eliminar elementos irrelevantes (scripts, estilos, navegación, cabeceras)
        for element in soup(["script", "style", "nav", "footer", "header"]):
            element.decompose()
            
        text = soup.get_text()
        
        # Limpiar espacios en blanco, tabulaciones y saltos de línea innecesarios
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        clean_text = '\n'.join(chunk for chunk in chunks if chunk)
        
        if not clean_text:
            raise ValueError("No se pudo extraer texto legible del contenido de la página.")
            
        return clean_text

    except requests.exceptions.Timeout:
        raise ValueError("La página tardó demasiado en responder. Intenta con otro enlace.")
    except requests.exceptions.ConnectionError:
        raise ValueError("No se pudo conectar con esa página. Verifica que el enlace sea correcto.")
    except requests.exceptions.HTTPError:
        status = response.status_code if 'response' in locals() else None
        if status == 404:
            raise ValueError("Esa página no existe (enlace roto o eliminado).")
        elif status == 403:
            raise ValueError("Esta página bloquea el acceso automático. Copia el texto manualmente o sube una captura.")
        else:
            raise ValueError("No se pudo acceder a esa página en este momento.")
    except ValueError:
        raise
    except Exception:
        raise ValueError("Ocurrió un error inesperado al leer esa página. Intenta de nuevo.")
