const { gql } = require('apollo-server-lambda');

module.exports = gql`
type Query {
    resolve(domain: String!, locations: [String]!): [LocationRecords]!
    resolveAll(domain: String!): [LocationRecords]!
    locations: [Location]!
}

union Record = ARecord | AAAARecord | CNAMERecord | NSRecord | PTRRecord | MXRecord | TXTRecord | NAPRTRecord | SOARecord | SRVRecord

type ARecord {
    type: String!
    address: String!
    ttl: Int!
}

type AAAARecord {
    type: String!
    address: String!
    ttl: Int!
}

type CNAMERecord {
    type: String!
    value: String!
}

type NSRecord {
    type: String!
    value: String!
}

type PTRRecord {
    type: String!
    value: String!
}

type MXRecord {
    type: String!
    exchange: String!
    priority: Int!    
}

type TXTRecord {
    type: String!
    entries: [String]!
}

type NAPRTRecord {
    type: String!
    flags: String!
    service: String!
    regexp: String!
    replacement: String!
    order: Int!
    preference: Int!
}

type SOARecord {
    type: String!
    nsname: String!
    hostmaster: String!
    serial: Int!
    refresh: Int!
    retry: Int!
    expire: Int!
    minttl: Int!
}

type SRVRecord {
    type: String!
    priority: Int!
    weight: Int!
    port: Int!
    name: String!
}

type Location {
    name: String!
    code: String!
}

type LocationRecords {
    records: [Record]!
    location: Location!
}
`
