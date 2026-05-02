  async testButton(page, buttonConfig) {
    const result = {
      name: buttonConfig.name,
      selector: buttonConfig.selector,
      type: buttonConfig.type || 'button',
      critical: buttonConfig.critical || false,
      status: 'error',
      exists: false,
      visible: false,
      clickable: false,
      functional: false,
      issues: []
    };

    try {
      // Verificar existencia
      const element = await page.$(buttonConfig.selector);
      if (!element) {
        result.issues.push('No encontrado en DOM');
        return result;
      }
      result.exists = true;

      // Verificar visibilidad
      const isVisible = await element.isVisible();
      if (!isVisible) {
        result.issues.push('No visible (puede estar oculto)');
      }
      result.visible = isVisible;

      // Verificar si no está disabled
      if (result.type === 'button') {
        const isDisabled = await element.isDisabled();
        if (isDisabled) {
          result.issues.push('Botón deshabilitado');
        } else {
          result.clickable = true;
        }
      }

      // Verificar área clickeable
      const boundingBox = await element.boundingBox();
      if (boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
        result.clickable = true;
      } else {
        result.issues.push('Sin área clickeable');
      }

      // Probar funcionalidad (para botones clickeables) con detección AJAX mejorada
      if (result.clickable && result.type === 'button') {
        const initialUrl = page.url();
        const selector = buttonConfig.selector;
        
        try {
          // Indicadores de funcionalidad
          const indicators = {
            urlChanged: false,
            domChanged: false,
            networkRequest: false,
            downloadTriggered: false,
            modalOpened: false,
            stateChanged: false
          };
          
          // Registrar listeners para eventos de red y descargas
          const requests = [];
          const requestListener = request => requests.push(request.url());
          page.on('request', requestListener);
          
          let downloadDetected = false;
          const downloadListener = download => { downloadDetected = true; };
          page.on('download', downloadListener);
          
          // Capturar estado inicial del botón
          const initialClass = await element.evaluate(btn => btn.className);
          
          // Hacer click
          await element.click({ timeout: 5000 });
          await page.waitForTimeout(1000); // Esperar efectos AJAX
          
          // 1. URL cambio
          const newUrl = page.url();
          indicators.urlChanged = newUrl !== initialUrl;
          
          // 2. DOM cambio (elementos nuevos/ocultos)
          try {
            await page.waitForSelector(`${selector} + *`, { timeout: 1000 });
            indicators.domChanged = true;
          } catch {}
          
          // 3. Network requests (AJAX)
          indicators.networkRequest = requests.length > 0;
          
          // 4. Download triggered
          indicators.downloadTriggered = downloadDetected;
          
          // 5. Modal/overlay abierto
          const modals = await page.$$('.modal, .overlay, [role="dialog"]');
          for (const modal of modals) {
            if (await modal.isVisible()) {
              indicators.modalOpened = true;
              break;
            }
          }
          
          // 6. State changed (clases CSS, atributos)
          const buttonAfter = await page.$(selector);
          if (buttonAfter) {
            const newClass = await buttonAfter.evaluate(btn => btn.className);
            indicators.stateChanged = newClass !== initialClass;
          }
          
          // Remover listeners
          page.removeListener('request', requestListener);
          page.removeListener('download', downloadListener);
          
          // Determinar si es funcional (al menos un indicador positivo)
          const isFunctional = Object.values(indicators).some(v => v === true);
          
          if (isFunctional) {
            result.functional = true;
            // Agregar detalles de indicadores positivos
            const activeIndicators = Object.entries(indicators)
              .filter(([k, v]) => v)
              .map(([k]) => k);
            result.issues.push(`Funcionalidad detectada: ${activeIndicators.join(', ')}`);
            
            // Si cambió URL, agregar redirección
            if (indicators.urlChanged) {
              result.issues.push(`Redirige a: ${newUrl}`);
            }
          } else {
            // Ningún indicador activo
            result.issues.push('Click sin cambio detectable en URL, DOM, red, descarga, modal o estado');
          }
          
          // Volver si cambió URL (para mantener estado inicial)
          if (indicators.urlChanged) {
            await page.goto(initialUrl, { waitUntil: 'networkidle' });
          }

        } catch (clickError) {
          result.issues.push(`Error al hacer click: ${clickError.message}`);
        }
      }

      // Determinar estado final (actualizado para considerar funcionalidad AJAX)
      if (result.functional) {
        result.status = 'pass';
      } else if (result.exists && result.clickable) {
        // Si es clickeable pero no se detectó funcionalidad, warning
        result.status = 'warning';
      } else {
        result.status = 'fail';
      }

    } catch (error) {
      result.issues.push(`Error general: ${error.message}`);
    }

    return result;
  }