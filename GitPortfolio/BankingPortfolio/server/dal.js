const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";

/**
 * Function used to find a user by email
 * @param {} email
 * @returns
 */
async function find(email) {
  const client = new MongoClient(uri);
  const database = client.db("badbank");

  try {
    const users = database.collection("users");
    const query = { email: email };
    const user = await users.findOne(query);

    if (user != null) return [user];
    else return [];
  } catch (err) {
    console.log("ERROR while finding user with email");
    throw err;
  } finally {
    await client.close();
  }
}

/**
 * findAll finds all the users in the database
 * @returns
 */
async function findAll() {
  const client = new MongoClient(uri);
  const database = client.db("badbank");

  try {
    const users = await database.collection("users");
    const allUsers = await users.find({}).toArray(function (err, docs) {
      err ? reject(err) : resolve(docs);
    });
    console.log("USERS ARE----" + JSON.stringify(allUsers));

    if (allUsers != null) return allUsers;
    else return [];
  } catch (err) {
    console.log("Error in findAll of dal" + err);
    throw err;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

/**
 * Function used to create a new user from the front end interface.
 * @param {Name of the user to be created } name
 * @param {Name of the user to be created } email
 * @param {uid of the user who is creating this user} uid
 * @param {Roles array of the user to be created } roles
 * @returns
 */
async function create(name, email, uid, roles) {
  const client = new MongoClient(uri);
  const database = client.db("badbank");
  let result = null;

  try {
    const users = database.collection("users");
    const doc = {
      name: name,
      email: email,
      uid: uid,
      roles: roles,
      balance: 0,
      history: [],
    };
    try {
      result = await users.insertOne(doc);
    } catch (err) {
      console.log("Error while creating user record" + err);
      throw err;
    }
    return result;
  } finally {
    await client.close();
  }
}

/**
 * Function updateUserHistory used to add a history record to the user after a transaction is performed
 * @param {Email of user to which history needs to be added} email
 * @param {transaction to be added to hisotry} history
 * @returns
 */
async function updateUserHistory(email, history) {
  const client = new MongoClient(uri);
  const database = client.db("badbank");
  let result = null;

  try {
    const query = { email: email };
    const update = {
      $push: {
        history: history,
      },
    };
    const options = { returnDocument: "after" }; //This ensures that the record returned is after the transaction is performed.
    const users = database.collection("users");

    result = await users.findOneAndUpdate(query, update, options);
    return result;
  } catch (err) {
    console.log("Error in updateUserHistory" + err);
    throw err;
  } finally {
    await client.close();
  }
}

/**
 * Function update used to update the balance of a user
 * @param {Email of user to be updated} email
 * @param {Amount to be changed in the balance. } changedAmt
 * @returns
 */
async function update(email, changedAmt) {
  const client = new MongoClient(uri);
  let result = null;

  try {
    await client.connect(); // Ensure the client connects before performing operations
    const database = client.db("badbank");
    const users = database.collection("users");

    const updateResult = await users.findOneAndUpdate(
      { email: email },
      { $inc: { balance: changedAmt } },
      { returnDocument: "after" } // Updated option for newer MongoDB versions
    );

    result = updateResult;
  } catch (err) {
    console.error("Error while findOneAndUpdate:", err);
    throw err;
  } finally {
    await client.close(); // Ensure client is closed properly
  }

  //console.log('Result of findOneAndUpdate:', JSON.stringify(result));
  return result;
}

module.exports = { create, find, update, updateUserHistory, findAll };
