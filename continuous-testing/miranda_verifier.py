#!/usr/bin/env python3
"""
Miranda Rule Verifier - Integración en testing continuo
Verifica que cada botón/acción tenga funcionalidad desarrollada.
"""

import json
import os
import sys
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging

# Configuración Playwright
try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("⚠️ Playwright no disponible. Instalar: pip install playwright && playwright install")

logger = logging.getLogger(__name__)

class MirandaVerifier:
    """Verificador de regla Miranda para botones/acciones."""
    
    def __init__(self, ws_endpoint: str = "ws://51.254.244.216:3000/"):
        self.ws_endpoint = ws_endpoint
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "rule": "Miranda Button/Action Verification",
            "summary": {"total": 0, "passed": 0, "failed": 0, "issues": 0},
            "details": []
        }
    
    async def verify_application(self, url: str, app_name: str, 
                               critical_buttons: Optional[List[Dict]] = None) -> Dict:
        """Verifica botones críticos en una aplicación."""
        
        if not PLAYWRIGHT_AVAILABLE:
            return {
                "error": "Playwright no disponible",
                "url": url,
                "app_name": app_name
            }
        
        result = {
            "url": url,
            "app_name": app_name,
            "timestamp": datetime.now().isoformat(),
            "critical_buttons": [],
            "issues_found": 0
        }
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.connect(self.ws_endpoint)
                page = await browser.new_page()
                
                logger.info(f"Navegando a {url}")
                await page.goto(url, wait_until="networkidle")
                
                # Si no se especifican botones críticos, detectar automáticamente
                if not critical_buttons:
                    critical_buttons = await self.detect_critical_buttons(page)
                
                result["critical_buttons"] = critical_buttons
                
                # Verificar cada botón crítico
                for button_info in critical_buttons:
                    button_result = await self.test_button(page, button_info)
                    result["critical_buttons"].append(button_result)
                    
                    if button_result["status"] != "pass":
                        result["issues_found"] += 1
                
                await browser.close()
                
        except Exception as e:
            logger.error(f"Error verificando {url}: {e}")
            result["error"] = str(e)
        
        return result
    
    async def detect_critical_buttons(self, page) -> List[Dict]:
        """Detecta botones críticos automáticamente."""
        critical_selectors = [
            {"name": "Botón Login", "selector": "a.btn:has-text('Login')"},
            {"name": "Botón Registro", "selector": "a.btn:has-text('Registro')"},
            {"name": "Botón Carrito", "selector": "a[href*='carrito']"},
            {"name": "Botón Buscar", "selector": "button:has-text('Buscar')"},
            {"name": "Botón Reservar", "selector": "a.btn-success"},
            {"name": "Botón Detalles", "selector": "a.btn-outline-primary"},
            {"name": "Formulario principal", "selector": "form", "type": "form"}
        ]
        
        detected = []
        for btn in critical_selectors:
            try:
                element = await page.query_selector(btn["selector"])
                if element:
                    is_visible = await element.is_visible()
                    if is_visible:
                        detected.append(btn)
            except:
                pass
        
        return detected
    
    async def test_button(self, page, button_info: Dict) -> Dict:
        """Testea un botón específico."""
        result = {
            "name": button_info["name"],
            "selector": button_info["selector"],
            "type": button_info.get("type", "button"),
            "status": "error",
            "exists": False,
            "visible": False,
            "clickable": False,
            "functional": False,
            "issues": []
        }
        
        try:
            # Verificar existencia
            element = await page.query_selector(button_info["selector"])
            if not element:
                result["issues"].append("No encontrado en DOM")
                return result
            
            result["exists"] = True
            
            # Verificar visibilidad
            is_visible = await element.is_visible()
            if not is_visible:
                result["issues"].append("No visible (puede estar oculto)")
            result["visible"] = is_visible
            
            # Verificar si no está disabled (solo botones)
            if button_info.get("type", "button") == "button":
                is_disabled = await element.is_disabled()
                if is_disabled:
                    result["issues"].append("Botón deshabilitado")
                else:
                    result["clickable"] = True
            
            # Verificar área clickeable
            bounding_box = await element.bounding_box()
            if bounding_box and bounding_box["width"] > 0 and bounding_box["height"] > 0:
                result["clickable"] = True
            else:
                result["issues"].append("Sin área clickeable")
            
            # Probar funcionalidad (solo si es clickeable)
            if result["clickable"] and button_info.get("type", "button") != "form":
                initial_url = page.url
                
                try:
                    await element.click(timeout=5000)
                    await asyncio.sleep(2)  # Esperar efectos
                    
                    new_url = page.url
                    
                    # Verificar cambios
                    if new_url != initial_url:
                        result["functional"] = True
                        result["issues"].append(f"Redirige a: {new_url}")
                    else:
                        # Verificar si hay cambios en contenido (simplificado)
                        # Podría expandirse para verificar modales, etc.
                        result["issues"].append("Click sin cambio detectable")
                
                except Exception as click_error:
                    result["issues"].append(f"Error al hacer click: {str(click_error)}")
            
            # Determinar estado final
            if result["functional"]:
                result["status"] = "pass"
            elif result["exists"] and result["clickable"]:
                result["status"] = "warning"
            else:
                result["status"] = "fail"
                
        except Exception as e:
            result["issues"].append(f"Error general: {str(e)}")
        
        return result
    
    def generate_report(self, results: List[Dict]) -> Dict:
        """Genera reporte consolidado."""
        report = {
            "timestamp": datetime.now().isoformat(),
            "rule": "Miranda Button/Action Verification",
            "summary": {
                "total_apps": len(results),
                "total_buttons": 0,
                "passed_buttons": 0,
                "failed_buttons": 0,
                "apps_with_issues": 0
            },
            "applications": results
        }
        
        for app in results:
            if "critical_buttons" in app:
                for btn in app["critical_buttons"]:
                    report["summary"]["total_buttons"] += 1
                    if btn.get("status") == "pass":
                        report["summary"]["passed_buttons"] += 1
                    elif btn.get("status") in ["fail", "error"]:
                        report["summary"]["failed_buttons"] += 1
            
            if app.get("issues_found", 0) > 0:
                report["summary"]["apps_with_issues"] += 1
        
        return report

async def main():
    """Función principal para testing."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Verificador Regla Miranda")
    parser.add_argument("--url", help="URL a verificar")
    parser.add_argument("--config", help="Archivo JSON con configuración")
    parser.add_argument("--output", default="miranda-report.json", help="Archivo de salida")
    
    args = parser.parse_args()
    
    verifier = MirandaVerifier()
    
    if args.url:
        # Verificar una URL específica
        result = await verifier.verify_application(args.url, "Aplicación")
        report = verifier.generate_report([result])
    
    elif args.config:
        # Verificar múltiples aplicaciones desde config
        with open(args.config, 'r') as f:
            config = json.load(f)
        
        results = []
        for app in config.get("applications", []):
            url = app.get("url")
            name = app.get("name", "Unknown")
            critical_buttons = app.get("critical_buttons")
            
            if url:
                result = await verifier.verify_application(url, name, critical_buttons)
                results.append(result)
        
        report = verifier.generate_report(results)
    
    else:
        print("Error: Especificar --url o --config")
        return
    
    # Guardar reporte
    with open(args.output, 'w') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"Reporte guardado en {args.output}")
    
    # Mostrar resumen
    summary = report["summary"]
    print(f"\n📊 RESUMEN REGLA MIRANDA:")
    print(f"   Aplicaciones verificadas: {summary['total_apps']}")
    print(f"   Botones totales: {summary['total_buttons']}")
    print(f"   ✅ Botones funcionales: {summary['passed_buttons']}")
    print(f"   ❌ Botones con problemas: {summary['failed_buttons']}")
    print(f"   ⚠️ Aplicaciones con issues: {summary['apps_with_issues']}")

if __name__ == "__main__":
    asyncio.run(main())