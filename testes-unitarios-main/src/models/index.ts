import mongoose from "mongoose";
const { Schema } = mongoose;

// define os schemas
const CarSchema = new Schema({
   model: {
    type: String,
    maxlength: [15, "O modelo pode ter no máximo 15 caracteres"],
    unique: true,
    required: [true, "O modelo é obrigatório"]    
  }
});

// define os schemas
const PersonSchema = new Schema({
  name: {
   type: String,
   maxlength: [30, "O nome pode ter no máximo 30 caracteres"],
   unique: true,
   required: [true, "O nome é obrigatório"]    
 }
});

const PhoneSchema = new Schema({
  person: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Person",
    required: [true, "A pessoa dona do telefone é obrigatória"],
    validate: {
      validator: async function (id:string) {
        const person = await Person.findById(id);
        return !!person; // true se a pessoa existir
      },
      message: 'A pessoa fornecida não existe',
    },
  },
  number: { 
    type: String, 
    match: [/^[0-9]{11}$/,"O telefone deve ter exatamente 11 dígitos"],
    required: [true, "O número é obrigatório"]   
  }
});

const CarByPersonSchema = new Schema({
  person: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Person",
    required: [true, "A pessoa é obrigatória"],
    validate: {
      validator: async function (id:string) {
        const person = await Person.findById(id);
        return !!person; // true se a pessoa existir
      },
      message: 'A pessoa fornecida não existe',
    },
  },
  car: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Car",
    required: [true, "O carro é obrigatório"],
    validate: {
      validator: async function (id:string) {
        const car = await Car.findById(id);
        return !!car; // true se o carro existir
      },
      message: 'O carro fornecido não existe',
    },
  },
});

// mongoose.model compila o modelo
const Car = mongoose.model("Car", CarSchema);
const Person = mongoose.model("Person", PersonSchema, "people");
const Phone = mongoose.model("Phone", PhoneSchema);
const CarByPerson = mongoose.model("CarByPerson", CarByPersonSchema, "car_by_persons");

export { Car, Person, Phone, CarByPerson };
