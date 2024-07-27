const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                sensorId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Sensor',
                    required: true
                }
            }
        ]
    }
});

userSchema.methods.addToCart = function(sensorId) {
    // Sprawdź, czy sensorId jest już w cart, aby uniknąć duplikatów
    const isSensorAlreadyInCart = this.cart.items.some(item => item.sensorId.equals(sensorId));

    // Jeśli sensor już istnieje w cart, zwróć obietnicę z błędem
    if (isSensorAlreadyInCart) {
        return Promise.reject('Sensor już znajduje się w karcie.');
    }

    // Jeśli sensor nie istnieje w cart, dodaj go
    this.cart.items.push({ sensorId: sensorId });
    
    // Zapisz zmiany w bazie danych i zwróć obietnicę
    return this.save();
};

module.exports = mongoose.model('User', userSchema);