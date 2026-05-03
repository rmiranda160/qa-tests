/**
 * Integración de pruebas de coherencia con testing continuo
 * 
 * Este script se ejecutará periódicamente para verificar coherencia UI
 * y alertar sobre incoherencias detectadas.
 */

const CoherenceTester = require('./coherence-tests');
const fs = require('fs');
const path = require('path');

class CoherenceIntegration {
  constructor() {
    this.tester = new CoherenceTester();
    this.alertsDir = path.join(__dirname, 'alerts');
    this.ensureDirectories();
  }
  
  ensureDirectories() {
    if (!fs.existsSync(this.alertsDir)) {
      fs.mkdirSync(this.alertsDir, { recursive: true });
    }
  }
  
  async runAndAlert() {
    console.log('🔍 EJECUTANDO PRUEBAS DE COHERENCIA CON ALERTAS');
    console.log('='.repeat(60));
    
    try {
      // Ejecutar pruebas
      const report = await this.tester.runDailyCoherenceTests();
      
      // Si hay incoherencias, preparar alerta para coordinator
      if (report.summary.failed > 0) {
        await this.createCoordinatorAlert(report);
        return {
          status: 'INCOHERENCE_DETECTED',
          report: report,
          alertCreated: true
        };
      }
      
      return {
        status: 'ALL_COHERENT',
        report: report,
        alertCreated: false
      };
      
    } catch (error) {
      console.error('❌ Error en pruebas de coherencia:', error);
      
      // Crear alerta de error
      await this.createErrorAlert(error);
      
      return {
        status: 'ERROR',
        error: error.message,
        alertCreated: true
      };
    }
  }
  
  async createCoordinatorAlert(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Mensaje para coordinator
    const alertMessage = `🚨 ALERTA DE INCOHERENCIA UI

Aplicación: ${report.application}
Fecha: ${new Date().toLocaleString()}

📊 RESULTADOS:
✅ Pruebas coherentes: ${report.summary.passed}
❌ Pruebas incoherentes: ${report.summary.failed}

🚨 INCOHERENCIAS DETECTADAS:
${report.summary.incoherences.map((inc, idx) => 
  `${idx + 1}. ${inc.test}\n   - ${inc.errors.join('\n   - ')}`
).join('\n\n')}

📸 Screenshot disponible en workspace raíz:
   /home/node/.openclaw/workspace-coordinator/incoherence-${timestamp}.png

📁 Reporte completo: ${path.join(__dirname, 'coherence-reports', `coherence-report-${timestamp}.json`)}

🔧 ACCIÓN REQUERIDA:
1. Revisar las incoherencias detectadas
2. Verificar la UI de ${report.application}
3. Corregir los elementos incoherentes
4. Re-ejecutar pruebas de coherencia`;

    // Guardar alerta en archivo
    const alertFile = path.join(this.alertsDir, `coordinator-alert-${timestamp}.txt`);
    fs.writeFileSync(alertFile, alertMessage);
    
    console.log(`📤 Alerta preparada para coordinator: ${alertFile}`);
    
    // También crear versión JSON para procesamiento automático
    const jsonAlert = {
      type: 'ui_coherence_alert',
      timestamp: new Date().toISOString(),
      application: report.application,
      incoherenceCount: report.summary.failed,
      incoherences: report.summary.incoherences,
      screenshot: `/home/node/.openclaw/workspace-coordinator/incoherence-${timestamp}.png`,
      report: `coherence-reports/coherence-report-${timestamp}.json`
    };
    
    const jsonAlertFile = path.join(this.alertsDir, `coordinator-alert-${timestamp}.json`);
    fs.writeFileSync(jsonAlertFile, JSON.stringify(jsonAlert, null, 2));
    
    return {
      textAlert: alertFile,
      jsonAlert: jsonAlertFile,
      message: alertMessage
    };
  }
  
  async createErrorAlert(error) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const errorAlert = `🚨 ERROR EN PRUEBAS DE COHERENCIA

Fecha: ${new Date().toLocaleString()}
Error: ${error.message}

Stack trace:
${error.stack}

🔧 ACCIÓN REQUERIDA:
1. Revisar el error en las pruebas de coherencia
2. Verificar conectividad con ${report?.application || 'la aplicación'}
3. Corregir el script de pruebas si es necesario`;

    const errorFile = path.join(this.alertsDir, `error-alert-${timestamp}.txt`);
    fs.writeFileSync(errorFile, errorAlert);
    
    console.log(`📤 Alerta de error preparada: ${errorFile}`);
  }
  
  // Método para ser llamado desde testing continuo
  async executeFromCron() {
    console.log('🕐 Ejecución programada de pruebas de coherencia');
    const result = await this.runAndAlert();
    
    // Si hay alerta, notificar via el método que corresponda
    if (result.alertCreated && result.status === 'INCOHERENCE_DETECTED') {
      // Aquí se integraría con el sistema de notificaciones
      console.log('🚨 Incoherencias detectadas - Notificación requerida');
    }
    
    return result;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const integration = new CoherenceIntegration();
  integration.executeFromCron()
    .then(result => {
      console.log(`✅ Ejecución completada: ${result.status}`);
      process.exit(result.status === 'ALL_COHERENT' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = CoherenceIntegration;