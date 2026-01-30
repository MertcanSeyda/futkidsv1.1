const mongoose = require('mongoose');
const { Types } = mongoose;

async function fix() {
    try {
        await mongoose.connect('mongodb://localhost:27017/futkids');
        console.log('Connected');

        const collection = mongoose.connection.db.collection('users');
        const users = await collection.find({ role: 'player' }).toArray();

        for (const u of users) {
            console.log(`Checking ${u.fullName}: academy type is ${typeof u.academy}`);
            if (typeof u.academy === 'string') {
                try {
                    const objectId = new Types.ObjectId(u.academy);
                    await collection.updateOne({ _id: u._id }, { $set: { academy: objectId } });
                    console.log(`FIXED: ${u.fullName}`);
                } catch (e) {
                    console.log(`Failed to fix ${u.fullName}: Invalid ObjectId`);
                }
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fix();
