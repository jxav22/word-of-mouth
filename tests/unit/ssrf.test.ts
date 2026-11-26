import { describe, expect, it } from 'vitest'
import { assertSafeUrl, isBlockedIp } from '../../src/lib/security/ssrf'

describe('ssrf', () => {
  it('blocks private and link-local IPs', () => {
    expect(isBlockedIp('127.0.0.1')).toBe(true)
    expect(isBlockedIp('10.0.0.5')).toBe(true)
    expect(isBlockedIp('192.168.1.1')).toBe(true)
    expect(isBlockedIp('169.254.169.254')).toBe(true)
    expect(isBlockedIp('172.16.0.1')).toBe(true)
    expect(isBlockedIp('0.0.0.0')).toBe(true)
    expect(isBlockedIp('100.64.1.1')).toBe(true)
    expect(isBlockedIp('8.8.8.8')).toBe(false)
  })

  it('blocks IPv6 localhost and mapped private', () => {
    expect(isBlockedIp('::1')).toBe(true)
    expect(isBlockedIp('::ffff:127.0.0.1')).toBe(true)
    expect(isBlockedIp('::ffff:10.0.0.1')).toBe(true)
    expect(isBlockedIp('fe80::1')).toBe(true)
  })

  it('rejects localhost, credentials, metadata, and weird hosts', async () => {
    expect((await assertSafeUrl('http://localhost/admin')).ok).toBe(false)
    expect((await assertSafeUrl('http://user:pass@example.com')).ok).toBe(false)
    expect((await assertSafeUrl('file:///etc/passwd')).ok).toBe(false)
    expect((await assertSafeUrl('http://127.0.0.1/')).ok).toBe(false)
    expect((await assertSafeUrl('http://169.254.169.254/latest/meta-data/')).ok).toBe(false)
    expect((await assertSafeUrl('http://metadata.google.internal/')).ok).toBe(false)
    expect((await assertSafeUrl('http://something.internal/')).ok).toBe(false)
    expect((await assertSafeUrl('http://2130706433/')).ok).toBe(false) // 127.0.0.1 decimal
  })

  it('allows public https hosts', async () => {
    const result = await assertSafeUrl('https://hn.algolia.com/api/v1/search?query=test')
    expect(result.ok).toBe(true)
  })
})
