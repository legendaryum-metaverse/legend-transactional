



const a = "{\"changesets\":[{\"releases\":[{\"name\":\"saga\",\"type\":\"patch\"}],\"summary\":\"asdawd\",\"id\":\"sweet-horses-joke\"}],\"releases\":[{\"name\":\"saga\",\"type\":\"patch\",\"oldVersion\":\"0.0.2\",\"changesets\":[\"sweet-horses-joke\"],\"newVersion\":\"0.0.3\"}]}\n";

const o = JSON.parse(a);
console.log(JSON.parse(o));
