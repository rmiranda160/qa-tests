/**
 * Versión simple de Faker para testing sin dependencias externas
 */

class SimpleFaker {
  constructor(locale = 'es') {
    this.locale = locale;
    this.data = this.getLocaleData();
  }
  
  getLocaleData() {
    return {
      es: {
        firstNames: ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Miguel', 'Isabel', 'David', 'Elena'],
        lastNames: ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín'],
        cities: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
        streets: ['Mayor', 'Real', 'Nueva', 'Sol', 'Luna', 'Gran Vía', 'Alcalá', 'Princesa', 'Castellana', 'Rambla'],
        bikeBrands: ['Specialized', 'Trek', 'Giant', 'Canyon', 'Orbea', 'Scott', 'Merida', 'Cube', 'Bianchi', 'Pinarello'],
        bikeTypes: ['MTB', 'Carretera', 'Eléctrica', 'Híbrida', 'Gravel', 'Urbana', 'Infantil', 'BMX', 'Plegable'],
        adjectives: ['Profesional', 'Deportiva', 'Cómoda', 'Ligera', 'Resistente', 'Moderno', 'Clásico', 'Premium', 'Económico'],
        materials: ['Aluminio', 'Carbono', 'Acero', 'Titanio', 'Fibra de vidrio', 'Aleación']
      }
    }[this.locale] || this.getLocaleData().es;
  }
  
  randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // ===== MÉTODOS FAKER COMPATIBLES =====
  
  name = {
    firstName: () => this.randomElement(this.data.firstNames),
    lastName: () => this.randomElement(this.data.lastNames)
  };
  
  phone = {
    phoneNumber: (format = '+34 6## ## ## ##') => {
      return format.replace(/#/g, () => this.randomNumber(0, 9));
    }
  };
  
  address = {
    streetAddress: () => `Calle ${this.randomElement(this.data.streets)} ${this.randomNumber(1, 200)}`,
    city: () => this.randomElement(this.data.cities),
    zipCode: () => `${this.randomNumber(1000, 52999)}`,
    country: () => 'España'
  };
  
  commerce = {
    productAdjective: () => this.randomElement(this.data.adjectives),
    productMaterial: () => this.randomElement(this.data.materials),
    productName: () => `Producto ${this.randomElement(this.data.adjectives)}`
  };
  
  random = {
    alphaNumeric: (length = 6) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
    number: (options = {}) => {
      const min = options.min || 0;
      const max = options.max || 99999;
      return this.randomNumber(min, max);
    }
  };
  
  lorem = {
    paragraph: (sentenceCount = 3) => {
      const sentences = [
        'Producto de alta calidad diseñado para ofrecer el máximo rendimiento.',
        'Ideal para usuarios que buscan fiabilidad y durabilidad.',
        'Fabricado con los mejores materiales disponibles en el mercado.',
        'Diseño ergonómico que garantiza comodidad durante el uso.',
        'Tecnología de vanguardia que mejora la experiencia del usuario.'
      ];
      return sentences.slice(0, sentenceCount).join(' ');
    },
    sentence: () => this.lorem.paragraph(1)
  };
  
  internet = {
    email: (firstName, lastName) => {
      const first = (firstName || this.name.firstName()).toLowerCase();
      const last = (lastName || this.name.lastName()).toLowerCase();
      const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'cenarbe.test'];
      return `${first}.${last}.${this.randomNumber(100, 999)}@${this.randomElement(domains)}`;
    }
  };
  
  date = {
    future: (years = 1) => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + years);
      return date;
    },
    past: (years = 1) => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - years);
      return date;
    },
    between: (from, to) => {
      const fromTime = from.getTime();
      const toTime = to.getTime();
      return new Date(fromTime + Math.random() * (toTime - fromTime));
    }
  };
  
  // ===== MÉTODOS ESPECÍFICOS PARA CENARBE =====
  
  bike = {
    brand: () => this.randomElement(this.data.bikeBrands),
    type: () => this.randomElement(this.data.bikeTypes),
    size: () => this.randomElement(['XS', 'S', 'M', 'L', 'XL']),
    model: () => `${this.randomElement(['Trail', 'Road', 'City', 'Mountain', 'Hybrid'])}-${this.randomNumber(100, 999)}`
  };
  
  reservation = {
    durationDays: () => this.randomNumber(1, 7),
    pricePerDay: () => this.randomNumber(20, 50),
    location: () => this.randomElement(['Villanúa', 'Jaca', 'Canfranc', 'Sabiniánigo', 'Biescas'])
  };
  
  payment = {
    method: () => this.randomElement(['credit_card', 'paypal', 'bank_transfer', 'cash']),
    status: () => this.randomElement(['pending', 'completed', 'failed', 'refunded'])
  };
}

// Exportar como módulo
module.exports = SimpleFaker;

// Si se ejecuta directamente, mostrar ejemplo
if (require.main === module) {
  const faker = new SimpleFaker('es');
  
  console.log('🧪 Ejemplo de datos generados:');
  console.log(`Nombre: ${faker.name.firstName()} ${faker.name.lastName()}`);
  console.log(`Email: ${faker.internet.email()}`);
  console.log(`Teléfono: ${faker.phone.phoneNumber()}`);
  console.log(`Dirección: ${faker.address.streetAddress()}, ${faker.address.city()}`);
  console.log(`Bicicleta: ${faker.bike.brand()} ${faker.bike.type()} ${faker.bike.model()}`);
  console.log(`Reserva: ${faker.reservation.durationDays()} días en ${faker.reservation.location()}`);
}