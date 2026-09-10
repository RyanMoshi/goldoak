import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'

/**
 * Phone numbers, anywhere in the world.
 *
 * The platform used to assume Kenya: anything starting with a zero got 254 in
 * front of it and anything else was checked against a length rule. That is
 * wrong for an agency with clients in Tanzania, Uganda, the Gulf or the UK, and
 * it silently mangles numbers rather than refusing them.
 *
 * Everything now goes through Google's phone number rules, which know the real
 * numbering plan of every country. A number written in any local or
 * international format is understood; a number that is not valid anywhere is
 * refused rather than guessed at.
 *
 * Stored form is E.164 digits with no leading plus, which is what the rest of
 * the platform and the WhatsApp gateway already expect.
 */

/** Used when a number is written in local form with no country code. */
export function defaultCountry(): CountryCode {
  const configured = process.env.DEFAULT_PHONE_COUNTRY?.trim().toUpperCase()
  if (configured && isSupportedCountry(configured)) return configured as CountryCode
  return 'KE'
}

export function isSupportedCountry(code: string): boolean {
  return (getCountries() as string[]).includes(code.toUpperCase())
}

/**
 * Reads a number in any shape and returns E.164 digits, or null when it is not
 * a valid number anywhere. `country` is only consulted for local formats.
 */
export function toE164(input: string, country?: string | null): string | null {
  const raw = (input ?? '').trim()
  if (!raw) return null

  const hint = country && isSupportedCountry(country) ? (country.toUpperCase() as CountryCode) : defaultCountry()
  // A leading + or 00 means the number carries its own country code, and the
  // hint must not be allowed to override it.
  const international = /^\s*(\+|00)/.test(raw)
  const normalized = international ? raw.replace(/^\s*00/, '+') : raw

  const parsed = parsePhoneNumberFromString(normalized, international ? undefined : hint)
  if (!parsed || !parsed.isValid()) return null
  return parsed.number.replace(/^\+/, '')
}

/** The country a stored number belongs to, for display and filtering. */
export function countryOf(e164Digits: string): CountryCode | null {
  const parsed = parsePhoneNumberFromString(`+${e164Digits.replace(/\D/g, '')}`)
  return parsed?.country ?? null
}

/** How a number should be shown to a person: grouped, with its country code. */
export function prettyPhone(e164Digits: string): string {
  const digits = (e164Digits ?? '').replace(/\D/g, '')
  if (!digits) return ''
  const parsed = parsePhoneNumberFromString(`+${digits}`)
  return parsed?.isValid() ? parsed.formatInternational() : `+${digits}`
}

/** Every dialling code, for a country picker. */
export function callingCodes(): { country: CountryCode; code: string }[] {
  return (getCountries() as CountryCode[])
    .map((country) => ({ country, code: getCountryCallingCode(country) }))
    .sort((a, b) => a.country.localeCompare(b.country))
}
