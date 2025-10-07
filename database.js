// database.js
import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/sabor-urbano';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error('Error conectando a MongoDB:', err));

export default mongoose; // <-- export default