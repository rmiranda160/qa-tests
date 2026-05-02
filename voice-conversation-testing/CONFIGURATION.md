# CONFIGURACIÓN DE ENTORNO - SISTEMA VOZ↔VOZ

## ENDPOINTS ESPERADOS

### Desarrollo Local (Docker Compose)
| Servicio | Puerto | Endpoint | Descripción |
|----------|--------|----------|-------------|
| Piper TTS | 5500 | `http://localhost:5500` | Servicio TTS |
| Backend Extendido | 3001 | `http://localhost:3001` | Backend principal |
| Nginx Proxy | 3002 | `http://localhost:3002` | Proxy unificado |
| Frontend Web | 3443 | `https://localhost:3443` | Interfaz usuario |

### Producción (Ejemplo)
| Servicio | URL | Notas |
|----------|-----|-------|
| Piper TTS | `https://tts.dominio.com` | Posiblemente detrás de proxy |
| Backend | `https://api.dominio.com` | Endpoint principal |
| Frontend | `https://app.dominio.com` | Interfaz usuario |

## VARIABLES DE ENTORNO

### Backend (ejemplo)
```
TTS_SERVICE_URL=http://piper-tts:5500
STT_SERVICE_URL=http://whisper-service:9000
DATABASE_URL=postgresql://user:pass@db:5432/voicechat
API_PORT=3001
CORS_ORIGINS=https://localhost:3443,http://localhost:3443
```

### Frontend (ejemplo)
```
VITE_API_URL=http://localhost:3002
VITE_WS_URL=ws://localhost:3002/ws
VITE_MAX_RECORDING_TIME=10000
VITE_LANGUAGE=es
```

## SERVICIOS DOCKER ESPERADOS

```yaml
version: '3.8'
services:
  piper-tts:
    image: rhasspy/piper-tts:latest
    ports:
      - "5500:5500"
    volumes:
      - ./models:/models
  
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - TTS_SERVICE_URL=http://piper-tts:5500
    depends_on:
      - piper-tts
  
  nginx:
    image: nginx:alpine
    ports:
      - "3002:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
```

## CONFIGURACIÓN NGINX (Ejemplo)

```nginx
server {
    listen 80;
    
    location /api/tts/ {
        proxy_pass http://piper-tts:5500/;
        proxy_set_header Host $host;
    }
    
    location /api/ {
        proxy_pass http://backend:3001/;
        proxy_set_header Host $host;
    }
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

## COMANDOS ÚTILES

### Verificar servicios
```bash
# Ver contenedores corriendo
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Ver logs de Piper TTS
docker logs piper-tts

# Ver logs del backend
docker logs voice-conversation-backend

# Probar salud endpoints
curl http://localhost:5500/health
curl http://localhost:3001/health
curl http://localhost:3002/api/tts/health
```

### Reiniciar servicios
```bash
# Reiniciar todo
docker-compose down && docker-compose up -d

# Reiniciar solo TTS
docker restart piper-tts

# Rebuild y levantar
docker-compose up -d --build
```

## SOLUCIÓN DE PROBLEMAS COMUNES

### Piper TTS no responde
```bash
# Verificar modelo descargado
docker exec piper-tts ls -la /models/

# Probar síntesis directa
curl -X POST http://localhost:5500/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Test", "language":"es"}' \
  -o test.wav
```

### CORS errors en frontend
- Verificar `CORS_ORIGINS` en backend incluye origen frontend
- Verificar configuración Nginx incluye headers CORS

### Audio no se reproduce
- Verificar formato de audio (WAV/MP3)
- Verificar headers Content-Type en respuesta
- Probar descargar audio y reproducir localmente

### STT no reconoce audio
- Verificar formato de audio enviado (WebM/Opus recomendado)
- Verificar sample rate (16kHz típico)
- Probar con audio claro y sin ruido

## MONITOREO

### Métricas clave
- Tiempo respuesta STT: `http://localhost:3001/metrics`
- Tiempo respuesta TTS: `http://localhost:5500/metrics` (si expone)
- Uso CPU/memoria contenedores: `docker stats`

### Logs centralizados
```bash
# Ver todos los logs combinados
docker-compose logs -f --tail=50

# Filtrar errores
docker-compose logs --tail=100 | grep -i error

# Logs específicos por servicio
docker-compose logs backend
```

## ACTUALIZACIONES

### Actualizar modelos TTS
```bash
# Descargar nuevo modelo
wget -P ./models https://example.com/new-model.onnx

# Reiniciar servicio
docker restart piper-tts
```

### Actualizar backend
```bash
cd backend
git pull
docker-compose up -d --build backend
```

---

**Nota:** Esta configuración es de ejemplo. Adaptar según implementación real del equipo.