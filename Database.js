class Database {
  constructor(name) {
    const database = firebase.database();
    const rootRef = database.ref(name);

    rootRef.on('value', this.onRootRefValue.bind(this));

    this._data = [];
  }

  onRootRefValue(snapshot) {
    this._data = snapshot.map(child => child.val());
    console.log(dataArr);
  }

  getData() {
    return this._data;
  }
}
