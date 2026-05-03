/**
 * Generador de datos de prueba para testing en entornos de pruebas
 * 
 * Características:
 * - Datos realistas pero ficticios
 * - Consistencia entre pruebas
 * - Limpieza automática después de pruebas
 * - No afecta datos de producción
 */

const SimpleFaker = require('./simple-faker');
const fs = require('fs');
const path = require('path');

class TestDataGenerator {
  constructor() {
    this.testDataDir = path.join(__dirname, 'test-data');
    this.ensureDirectories();
    
    // Usar nuestro simple-faker
    this.faker = new SimpleFaker('es');
  }
  
  ensureDirectories() {
    if (!fs.existsSync(this.testDataDir)) {
      fs.mkdirSync(this.testDataDir, { recursive: true });
    }
  }
  
  // ===== GENERADORES DE DATOS =====
  
  generateUser(testId = 'default') {
    const timestamp = Date.now();
    const user = {
      id: `test_user_${timestamp}_${testId}`,
      email: `test.user.${timestamp}@cenarbe.test`,
      password: 'Test123!',
      firstName: this.faker.name.firstName(),
      lastName: this.faker.name.lastName(),
      phone: this.faker.phone.phoneNumber('+34 6## ## ## ##'),
      address: {
        street: this.faker.address.streetAddress(),
        city: this.faker.address.city(),
        zipCode: this.faker.address.zipCode(),
        country: 'España'
      },
      createdAt: new Date().toISOString(),
      testId: testId,
      metadata: {
        isTestData: true,
        canBeDeleted: true,
        testTimestamp: timestamp
      }
    };
    
    this.saveTestData('users', user);
    return user;
  }
  
  generateBikeReservation(userId, testId = 'default') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Mañana
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3); // 3 días después
    
    const bikeTypes = ['MTB', 'Carretera', 'Eléctrica', 'Híbrida', 'Infantil'];
    const locations = ['Villanúa', 'Jaca', 'Canfranc', 'Sabiniánigo', 'Biescas'];
    
    const reservation = {
      id: `res_${Date.now()}_${testId}`,
      userId: userId,
      bikeType: bikeTypes[Math.floor(Math.random() * bikeTypes.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      durationDays: 3,
      pricePerDay: [25, 30, 35, 40, 45][Math.floor(Math.random() * 5)],
      totalPrice: 0, // Se calcula
      status: 'pending',
      createdAt: new Date().toISOString(),
      testId: testId,
      metadata: {
        isTestData: true,
        canBeDeleted: true
      }
    };
    
    reservation.totalPrice = reservation.pricePerDay * reservation.durationDays;
    
    this.saveTestData('reservations', reservation);
    return reservation;
  }
  
  generatePayment(reservationId, amount, testId = 'default') {
    const paymentMethods = ['credit_card', 'paypal', 'bank_transfer', 'cash'];
    
    const payment = {
      id: `pay_${Date.now()}_${testId}`,
      reservationId: reservationId,
      amount: amount,
      currency: 'EUR',
      method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status: 'completed',
      transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processedAt: new Date().toISOString(),
      testId: testId,
      metadata: {
        isTestData: true,
        canBeDeleted: true
      }
    };
    
    this.saveTestData('payments', payment);
    return payment;
  }
  
  generateBike(bikeId = null, testId = 'default') {
    const bike = {
      id: bikeId || `bike_${Date.now()}_${testId}`,
      name: `Bicicleta ${this.faker.commerce.productAdjective()} ${this.faker.commerce.productMaterial()}`,
      type: this.faker.bike.type(),
      brand: this.faker.bike.brand(),
      model: this.faker.bike.model(),
      size: this.faker.bike.size(),
      pricePerHour: 8,
      pricePerDay: 35,
      available: true,
      location: 'Villanúa',
      description: this.faker.lorem.paragraph(),
      features: [
        'Suspensión delantera',
        'Frenos de disco',
        '21 velocidades',
        'Cuadro de aluminio'
      ],
      testId: testId,
      metadata: {
        isTestData: true,
        canBeDeleted: true
      }
    };
    
    this.saveTestData('bikes', bike);
    return bike;
  }
  
  // ===== FLUJOS COMPLETOS DE PRUEBA =====
  
  async generateCompleteReservationFlow(testId = 'reservation_flow') {
    console.log(`🧪 Generando flujo completo de reserva (${testId})...`);
    
    // 1. Crear usuario de prueba
    const user = this.generateUser(testId);
    console.log(`   👤 Usuario creado: ${user.email}`);
    
    // 2. Crear reserva
    const reservation = this.generateBikeReservation(user.id, testId);
    console.log(`   🚲 Reserva creada: ${reservation.id} (${reservation.bikeType})`);
    
    // 3. Crear pago
    const payment = this.generatePayment(reservation.id, reservation.totalPrice, testId);
    console.log(`   💳 Pago creado: ${payment.id} (${payment.amount}€)`);
    
    // 4. Actualizar estado de reserva
    reservation.status = 'confirmed';
    reservation.paymentId = payment.id;
    this.saveTestData('reservations', reservation);
    
    const flow = {
      testId: testId,
      timestamp: new Date().toISOString(),
      user: user,
      reservation: reservation,
      payment: payment,
      steps: ['user_created', 'reservation_created', 'payment_created', 'reservation_confirmed']
    };
    
    this.saveTestData('flows', flow);
    console.log(`   ✅ Flujo completo generado: ${testId}`);
    
    return flow;
  }
  
  async generateUserRegistrationFlow(testId = 'registration_flow') {
    console.log(`🧪 Generando flujo de registro de usuario (${testId})...`);
    
    const user = this.generateUser(testId);
    
    const flow = {
      testId: testId,
      timestamp: new Date().toISOString(),
      user: user,
      steps: ['user_created']
    };
    
    this.saveTestData('flows', flow);
    console.log(`   ✅ Flujo de registro generado: ${user.email}`);
    
    return flow;
  }
  
  // ===== UTILIDADES =====
  
  saveTestData(category, data) {
    const categoryDir = path.join(this.testDataDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    const filename = `${data.id || data.testId || Date.now()}.json`;
    const filepath = path.join(categoryDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    
    // También guardar en índice
    this.updateIndex(category, data);
  }
  
  updateIndex(category, data) {
    const indexFile = path.join(this.testDataDir, `${category}-index.json`);
    let index = [];
    
    if (fs.existsSync(indexFile)) {
      index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    }
    
    index.push({
      id: data.id || data.testId,
      timestamp: data.createdAt || new Date().toISOString(),
      testId: data.testId,
      file: `${category}/${data.id || data.testId || Date.now()}.json`
    });
    
    // Mantener solo los últimos 100 registros por categoría
    if (index.length > 100) {
      index = index.slice(-100);
    }
    
    fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));
  }
  
  // ===== LIMPIEZA =====
  
  cleanupOldTestData(maxAgeHours = 24) {
    console.log(`🧹 Limpiando datos de prueba antiguos (>${maxAgeHours}h)...`);
    
    const categories = ['users', 'reservations', 'payments', 'bikes', 'flows'];
    let deletedCount = 0;
    
    categories.forEach(category => {
      const categoryDir = path.join(this.testDataDir, category);
      if (fs.existsSync(categoryDir)) {
        const files = fs.readdirSync(categoryDir);
        const now = Date.now();
        const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
        
        files.forEach(file => {
          if (file.endsWith('.json')) {
            const filepath = path.join(categoryDir, file);
            const stats = fs.statSync(filepath);
            const ageMs = now - stats.mtimeMs;
            
            if (ageMs > maxAgeMs) {
              try {
                const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                
                // Solo eliminar si es dato de prueba y puede ser eliminado
                if (data.metadata?.isTestData && data.metadata?.canBeDeleted) {
                  fs.unlinkSync(filepath);
                  deletedCount++;
                }
              } catch (error) {
                console.warn(`   ⚠️ Error procesando ${filepath}: ${error.message}`);
              }
            }
          }
        });
      }
    });
    
    if (deletedCount > 0) {
      console.log(`   ✅ Eliminados ${deletedCount} archivos de datos de prueba antiguos`);
    } else {
      console.log(`   ℹ️ No se encontraron datos antiguos para eliminar`);
    }
    
    return deletedCount;
  }
  
  // ===== OBTENER DATOS PARA TESTING =====
  
  getTestUser(testId = 'default') {
    const indexFile = path.join(this.testDataDir, 'users-index.json');
    if (!fs.existsSync(indexFile)) {
      return this.generateUser(testId);
    }
    
    const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    const userEntry = index.find(entry => entry.testId === testId);
    
    if (userEntry && fs.existsSync(path.join(this.testDataDir, userEntry.file))) {
      return JSON.parse(fs.readFileSync(path.join(this.testDataDir, userEntry.file), 'utf8'));
    }
    
    return this.generateUser(testId);
  }
  
  getTestCredentials(testId = 'default') {
    const user = this.getTestUser(testId);
    return {
      email: user.email,
      password: user.password,
      userId: user.id
    };
  }
  
  // ===== INTEGRACIÓN CON TESTING =====
  
  async prepareTestEnvironment(testSuite) {
    console.log(`🔧 Preparando entorno de prueba para: ${testSuite}`);
    
    const preparations = {
      'reservation_flow': async () => {
        return await this.generateCompleteReservationFlow(`auto_${testSuite}_${Date.now()}`);
      },
      'user_registration': async () => {
        return await this.generateUserRegistrationFlow(`auto_${testSuite}_${Date.now()}`);
      },
      'login_test': async () => {
        const user = this.generateUser(`auto_login_${Date.now()}`);
        return { user };
      },
      'bike_catalog': async () => {
        const bikes = [];
        for (let i = 0; i < 5; i++) {
          bikes.push(this.generateBike(null, `auto_catalog_${Date.now()}_${i}`));
        }
        return { bikes };
      }
    };
    
    if (preparations[testSuite]) {
      return await preparations[testSuite]();
    }
    
    // Preparación por defecto: usuario de prueba
    const user = this.generateUser(`auto_${testSuite}_${Date.now()}`);
    return { user };
  }
}

// Si faker no está instalado, crear versión simple
if (typeof faker === 'undefined') {
  // Implementación mínima para pruebas
  const simpleFaker = {
    name: {
      firstName: () => ['Juan', 'María', 'Carlos', 'Ana', 'Pedro'][Math.floor(Math.random() * 5)],
      lastName: () => ['García', 'Rodríguez', 'González', 'Fernández', 'López'][Math.floor(Math.random() * 5)]
    },
    phone: {
      phoneNumber: () => '+34 600 00 00 00'
    },
    address: {
      streetAddress: () => `Calle ${['Mayor', 'Real', 'Nueva', 'Sol', 'Luna'][Math.floor(Math.random() * 5)]} ${Math.floor(Math.random() * 100)}`,
      city: () => ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza'][Math.floor(Math.random() * 5)],
      zipCode: () => `${Math.floor(Math.random() * 50000) + 1000}`
    },
    commerce: {
      productAdjective: () => ['Profesional', 'Deportiva', 'Cómoda', 'Ligera', 'Resistente'][Math.floor(Math.random() * 5)],
      productMaterial: () => ['Aluminio', 'Carbono', 'Acero', 'Titanio'][Math.floor(Math.random() * 4)]
    },
    random: {
      alphaNumeric: (length) => Math.random().toString(36).substr(2, length).toUpperCase()
    },
    lorem: {
      paragraph: () => 'Bicicleta de alta calidad para todo tipo de terrenos.'
    }
  };
  
  module.exports = simpleFaker;
} else {
  module.exports = faker;
}

// Ejemplo de uso
if (require.main === module) {
  const generator = new TestDataGenerator();
  
  // Generar datos de ejemplo
  console.log('🧪 Generando datos de prueba de ejemplo...');
  const user = generator.generateUser('demo');
  console.log(`✅ Usuario: ${user.email} / ${user.password}`);
  
  const reservation = generator.generateBikeReservation(user.id, 'demo');
  console.log(`✅ Reserva: ${reservation.bikeType} - ${reservation.totalPrice}€`);
  
  const payment = generator.generatePayment(reservation.id, reservation.totalPrice, 'demo');
  console.log(`✅ Pago: ${payment.method} - ${payment.amount}€`);
  
  // Limpiar datos antiguos
  generator.cleanupOldTestData(1); // Eliminar datos >1 hora
  
  console.log('\n📁 Datos guardados en:', generator.testDataDir);
}

module.exports = TestDataGenerator;