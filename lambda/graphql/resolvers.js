const data = require('./data')

const checker = require('./dns/checker')

const locations = Object.keys(data.countries).reduce((agg, key) => [...agg, { code: key, name: data.countries[key] }], [])

module.exports = {
    Query: {
        locations: () => locations,
        resolve: async (_, { domain, locations }) => {
            var result = []
            for (var i = 0; i < locations.length; i++) {
                const location = locations[i]
                const records = (await checker(domain, data.servers[location].servers)).flat()
                console.log(records)
                console.log("DABA")
                result = [...result, {
                    location: {
                        code: location,
                        name: data.countries[location]
                    },
                    records
                }]
            }
            return result
        },
        resolveAll: (domain) => {

        }
    },
    Record: {
        __resolveType(obj){
            if (obj.type) {
                return `${obj.type}Record`
            }
            return null;
          },
    }
};

