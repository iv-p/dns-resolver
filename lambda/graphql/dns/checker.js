const dns = require('dns')

const rrtype = ['CNAME', 'MX', 'NAPTR', 'NS', 'PTR', 'SOA', 'SRV', 'TXT']

const handleErr = (err, resolve, reject) => {
    if (err) {
        if (err.code == 'ENODATA') {
            resolve([])
            return true
        }
        reject(err)
        return true
    }
    return false
}

module.exports = async (domain, servers) => {
    dns.setServers(servers)
    const ipv4 = new Promise((resolve, reject) =>
        dns.resolve4(domain, { ttl: true }, (err, records) => {
            if (handleErr(err, resolve, reject)) { return }
            return resolve(records.map(record => ({ ...record, type: 'A' })))
        })
    )

    const ipv6 = new Promise((resolve, reject) =>
        dns.resolve6(domain, { ttl: true }, (err, records) => {
            if (handleErr(err, resolve, reject)) { return }
            return resolve(records.map(record => ({ ...record, type: 'AAAA' })))
        })
    )

    const cname = new Promise((resolve, reject) =>
        dns.resolveCname(domain, (err, records) => {
            if (handleErr(err, resolve, reject)) { return }
            return resolve(records.map(record => ({ value: record, type: 'CNAME' })))
        })
    )

    const mx = new Promise((resolve, reject) =>
        dns.resolveMx(domain, (err, records) => {
            if (handleErr(err, resolve, reject)) { return }
            return resolve(records.map(record => ({ ...record, type: 'MX' })))
        })
    )

    const naptr = new Promise((resolve, reject) =>
        dns.resolveNaptr(domain, (err, records) => {
            if (handleErr(err, resolve, reject)) { return }
            return resolve({ ...records, type: 'NAPRT' })
        })
    )

    const ns = new Promise((resolve, reject) =>
        dns.resolveNs(domain, (err, records) => {
            if (handleErr(err, resolve, reject)) { return }
            return resolve(records.map(record => ({ value: record, type: 'NS' })))
        })
    )

    const ptr = new Promise((resolve, reject) =>
        dns.resolvePtr(domain, (err, records) => {
            if (handleErr(err, resolve, reject)) { return }
            return resolve(records.map(record => ({ value: record, type: 'PTR' })))
        })
    )

    const soa = new Promise((resolve, reject) =>
        dns.resolvePtr(domain, (err, records) => {
            if (handleErr(err, resolve, reject)) { return }
            return resolve({ ...records, type: 'SOA' })
        })
    )

    const srv = new Promise((resolve, reject) =>
        dns.resolveSrv(domain, (err, records) => {
            if (handleErr(err, resolve, reject)) { return }
            return resolve(records.map(record => ({ value: record, type: 'SRV' })))
        })
    )

    const txt = new Promise((resolve, reject) =>
        dns.resolveTxt(domain, (err, records) => {
            if (handleErr(err, resolve, reject)) { return }
            return resolve(records.map(record => ({ entries: record, type: 'TXT' })))
        })
    )

    console.log("HOHO")
    return await Promise.all([ipv4, ipv6, cname, mx, naptr, ns, ptr, soa, srv, txt])
}