# Guía de Despliegue — Google Cloud Platform

## Prerrequisitos

1. **GCP Project** creado con billing habilitado
2. **gcloud CLI** instalado y autenticado (`gcloud auth login`)
3. **Docker** instalado localmente (para pruebas)
4. APIs habilitadas:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

## 1. Crear Repository en Artifact Registry

```bash
# Crear el repository (una sola vez)
gcloud artifacts repositories create taller01-artifacts \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker images for Taller 01"

# Autenticar Docker con Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev
```

## 2. Despliegue Manual (desde la máquina local)

### Frontend
```bash
cd frontend
docker build -t taller01-frontend .
docker run -p 5173:80 taller01-frontend
# Abrir http://localhost:5173
```

### Backend
```bash
cd backend
docker build -t taller01-backend .
docker run -p 3001:3001 taller01-backend
# Backend disponible en http://localhost:3001
```

## 3. Despliegue con Cloud Build (CI/CD)

### Configurar variables en Cloud Build
```bash
# Usar el cloudbuild.yaml de la raíz del proyecto
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_AR_REGION=us-central1,_DEPLOY_REGION=us-central1 .
```

### Configurar trigger automático desde GitHub
```bash
# Conectar repositorio GitHub a Cloud Build
gcloud builds connections create github github-connection \
  --project=$(gcloud config get-value project)

# Crear trigger para la rama main
gcloud builds triggers create github \
  --repo-name=taller01 \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern=^main$ \
  --build-config=cloudbuild.yaml \
  --name=deploy-main
```

## 4. Variables de Entorno

El backend puede configurarse con estas variables:

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto del servidor | `3001` |

## 5. Verificar el Despliegue

```bash
# Ver servicios desplegados
gcloud run services list --platform=managed --region=us-central1

# Ver logs del frontend
gcloud run services logs read frontend --platform=managed --region=us-central1 --limit=20

# Ver logs del backend
gcloud run services logs read backend --platform=managed --region=us-central1 --limit=20

# Obtener URL del frontend
gcloud run services describe frontend --platform=managed --region=us-central1 --format='value(status.url)'

# Obtener URL del backend
gcloud run services describe backend --platform=managed --region=us-central1 --format='value(status.url)'
```

## 6. Configuración de Autoscaling

Cloud Run está configurado con:
- **min-instances: 0** — El backend se apaga cuando no hay tráfico (ahorro de costo)
- **max-instances: 3** — Límite máximo de instancias concurrentes
- **Concurrencia:** 80 requests por instancia (default de Cloud Run)

> **Nota:** Con min-instances=0, el primer request después de un periodo de inactividad puede tardar 1-3 segundos (cold start).
