import { describe, expect, it } from "vitest";
import {
	AutoRenewStatus,
	CheckDomainAvailabilityInput,
	Contact,
	CreateContactInput,
	DisableAutoRenewInput,
	DnssecStatus,
	Domain,
	DomainAvailability,
	DomainStatus,
	EnableAutoRenewInput,
	GetContactInput,
	GetDomainInput,
	GetTldInput,
	ListContactsInput,
	ListDomainsInput,
	ListTldsInput,
	RegisterDomainInput,
	RegistrarLockStatus,
	RenewDomainInput,
	Tld,
	TransferDomainInput,
	TransferStatus,
	UpdateContactInput,
	UpdateDomainInput,
} from "../../../../src/tools/domain-registrar/types.js";

// ── Enum Schemas ───────────────────────────────────────────────────────────

describe("AutoRenewStatus", () => {
	it("accepts valid values", () => {
		expect(AutoRenewStatus.parse("enabled")).toBe("enabled");
		expect(AutoRenewStatus.parse("disabled")).toBe("disabled");
		expect(AutoRenewStatus.parse("not_supported")).toBe("not_supported");
	});
	it("rejects invalid values", () => {
		expect(() => AutoRenewStatus.parse("unknown")).toThrow();
	});
});

describe("DnssecStatus", () => {
	it("accepts valid values", () => {
		expect(DnssecStatus.parse("enabled")).toBe("enabled");
		expect(DnssecStatus.parse("disabled")).toBe("disabled");
	});
	it("rejects invalid values", () => {
		expect(() => DnssecStatus.parse("pending")).toThrow();
	});
});

describe("RegistrarLockStatus", () => {
	it("accepts valid values", () => {
		expect(RegistrarLockStatus.parse("locked")).toBe("locked");
		expect(RegistrarLockStatus.parse("unlocked")).toBe("unlocked");
	});
	it("rejects invalid values", () => {
		expect(() => RegistrarLockStatus.parse("partial")).toThrow();
	});
});

describe("DomainStatus", () => {
	it("accepts all valid values", () => {
		for (const v of [
			"active",
			"expired",
			"pending_transfer",
			"pending_registration",
			"redemption",
			"deleting",
		]) {
			expect(DomainStatus.parse(v)).toBe(v);
		}
	});
	it("rejects invalid values", () => {
		expect(() => DomainStatus.parse("suspended")).toThrow();
	});
});

describe("TransferStatus", () => {
	it("accepts all valid values", () => {
		for (const v of ["pending", "waiting_transfer", "processing", "done", "failed"]) {
			expect(TransferStatus.parse(v)).toBe(v);
		}
	});
	it("rejects invalid values", () => {
		expect(() => TransferStatus.parse("cancelled")).toThrow();
	});
});

// ── Entity Schemas ─────────────────────────────────────────────────────────

const validDomain = {
	domain: "example.com",
	registrar: "scaleway",
	status: "active",
	auto_renew_status: "enabled",
	dnssec_status: "disabled",
	updated_at: "2025-01-01T00:00:00Z",
	registrar_lock_status: "locked",
	organization_id: "org-123",
	project_id: "proj-456",
};

describe("Domain", () => {
	it("accepts a valid domain object", () => {
		const result = Domain.parse(validDomain);
		expect(result.domain).toBe("example.com");
	});
	it("accepts domain with optional fields", () => {
		const result = Domain.parse({
			...validDomain,
			epp_code: "ABC123",
			expired_at: "2026-01-01T00:00:00Z",
		});
		expect(result.epp_code).toBe("ABC123");
		expect(result.expired_at).toBe("2026-01-01T00:00:00Z");
	});
	it("rejects domain without required fields", () => {
		expect(() => Domain.parse({ domain: "example.com" })).toThrow();
	});
});

const validContact = {
	id: "contact-123",
	firstname: "John",
	lastname: "Doe",
	email: "john@example.com",
	phone: "+33612345678",
	address_line_1: "1 Rue de Paris",
	city: "Paris",
	zip: "75001",
	country: "FR",
};

describe("Contact", () => {
	it("accepts a valid contact object", () => {
		const result = Contact.parse(validContact);
		expect(result.id).toBe("contact-123");
	});
	it("accepts contact with optional fields", () => {
		const result = Contact.parse({
			...validContact,
			company_name: "ACME Corp",
			state: "Ile-de-France",
		});
		expect(result.company_name).toBe("ACME Corp");
	});
	it("rejects contact with invalid email", () => {
		expect(() => Contact.parse({ ...validContact, email: "not-email" })).toThrow();
	});
});

describe("DomainAvailability", () => {
	it("accepts valid availability", () => {
		const result = DomainAvailability.parse({
			domain: "example.com",
			available: true,
			tld: "com",
		});
		expect(result.available).toBe(true);
	});
	it("rejects missing fields", () => {
		expect(() => DomainAvailability.parse({ domain: "example.com" })).toThrow();
	});
});

describe("Tld", () => {
	it("accepts a valid TLD", () => {
		const result = Tld.parse({
			name: "com",
			dnssec_support: true,
			offers: [{ action: "register", price: 9.99 }],
		});
		expect(result.name).toBe("com");
		expect(result.offers).toHaveLength(1);
	});
	it("rejects invalid TLD", () => {
		expect(() => Tld.parse({ name: "com" })).toThrow();
	});
});

// ── Input Schemas ──────────────────────────────────────────────────────────

describe("ListDomainsInput", () => {
	it("applies defaults", () => {
		const result = ListDomainsInput.parse({});
		expect(result.page).toBe(1);
		expect(result.page_size).toBe(50);
	});
	it("accepts all optional params", () => {
		const result = ListDomainsInput.parse({
			page: 2,
			page_size: 25,
			project_id: "proj-1",
			organization_id: "org-1",
			order_by: "domain_asc",
		});
		expect(result.order_by).toBe("domain_asc");
	});
	it("rejects invalid page", () => {
		expect(() => ListDomainsInput.parse({ page: 0 })).toThrow();
	});
	it("rejects page_size > 100", () => {
		expect(() => ListDomainsInput.parse({ page_size: 101 })).toThrow();
	});
	it("rejects invalid order_by", () => {
		expect(() => ListDomainsInput.parse({ order_by: "invalid" })).toThrow();
	});
});

describe("GetDomainInput", () => {
	it("accepts valid domain", () => {
		expect(GetDomainInput.parse({ domain: "example.com" }).domain).toBe("example.com");
	});
	it("rejects empty domain", () => {
		expect(() => GetDomainInput.parse({ domain: "" })).toThrow();
	});
});

describe("RegisterDomainInput", () => {
	it("applies default duration", () => {
		const result = RegisterDomainInput.parse({
			domain: "example.com",
			project_id: "proj-1",
			owner_contact_id: "contact-1",
		});
		expect(result.duration_in_years).toBe(1);
	});
	it("accepts full input", () => {
		const result = RegisterDomainInput.parse({
			domain: "example.com",
			duration_in_years: 5,
			project_id: "proj-1",
			owner_contact_id: "contact-1",
			admin_contact_id: "contact-2",
			tech_contact_id: "contact-3",
		});
		expect(result.admin_contact_id).toBe("contact-2");
	});
	it("rejects duration > 10", () => {
		expect(() =>
			RegisterDomainInput.parse({
				domain: "example.com",
				duration_in_years: 11,
				project_id: "proj-1",
				owner_contact_id: "c-1",
			}),
		).toThrow();
	});
	it("rejects missing required fields", () => {
		expect(() => RegisterDomainInput.parse({ domain: "example.com" })).toThrow();
	});
});

describe("RenewDomainInput", () => {
	it("applies default duration", () => {
		const result = RenewDomainInput.parse({ domain: "example.com" });
		expect(result.duration_in_years).toBe(1);
	});
	it("rejects empty domain", () => {
		expect(() => RenewDomainInput.parse({ domain: "" })).toThrow();
	});
});

describe("TransferDomainInput", () => {
	it("accepts valid transfer input", () => {
		const result = TransferDomainInput.parse({
			domain: "example.com",
			auth_code: "XYZ789",
			project_id: "proj-1",
			owner_contact_id: "contact-1",
		});
		expect(result.auth_code).toBe("XYZ789");
	});
	it("rejects missing auth_code", () => {
		expect(() =>
			TransferDomainInput.parse({
				domain: "example.com",
				project_id: "proj-1",
				owner_contact_id: "c-1",
			}),
		).toThrow();
	});
});

describe("UpdateDomainInput", () => {
	it("accepts minimal input", () => {
		const result = UpdateDomainInput.parse({ domain: "example.com" });
		expect(result.domain).toBe("example.com");
	});
	it("accepts all optional contact IDs", () => {
		const result = UpdateDomainInput.parse({
			domain: "example.com",
			owner_contact_id: "c-1",
			admin_contact_id: "c-2",
			tech_contact_id: "c-3",
		});
		expect(result.tech_contact_id).toBe("c-3");
	});
});

describe("EnableAutoRenewInput", () => {
	it("accepts valid domain", () => {
		expect(EnableAutoRenewInput.parse({ domain: "example.com" }).domain).toBe("example.com");
	});
	it("rejects empty domain", () => {
		expect(() => EnableAutoRenewInput.parse({ domain: "" })).toThrow();
	});
});

describe("DisableAutoRenewInput", () => {
	it("accepts valid domain", () => {
		expect(DisableAutoRenewInput.parse({ domain: "example.com" }).domain).toBe("example.com");
	});
	it("rejects empty domain", () => {
		expect(() => DisableAutoRenewInput.parse({ domain: "" })).toThrow();
	});
});

describe("CheckDomainAvailabilityInput", () => {
	it("accepts valid domain", () => {
		expect(CheckDomainAvailabilityInput.parse({ domain: "example.com" }).domain).toBe(
			"example.com",
		);
	});
	it("rejects empty domain", () => {
		expect(() => CheckDomainAvailabilityInput.parse({ domain: "" })).toThrow();
	});
});

describe("ListContactsInput", () => {
	it("applies defaults", () => {
		const result = ListContactsInput.parse({});
		expect(result.page).toBe(1);
		expect(result.page_size).toBe(50);
	});
	it("accepts all optional params", () => {
		const result = ListContactsInput.parse({
			page: 3,
			page_size: 10,
			domain: "example.com",
			project_id: "proj-1",
			organization_id: "org-1",
		});
		expect(result.domain).toBe("example.com");
	});
});

describe("GetContactInput", () => {
	it("accepts valid contact_id", () => {
		expect(GetContactInput.parse({ contact_id: "c-1" }).contact_id).toBe("c-1");
	});
	it("rejects empty contact_id", () => {
		expect(() => GetContactInput.parse({ contact_id: "" })).toThrow();
	});
});

describe("CreateContactInput", () => {
	it("accepts valid input", () => {
		const result = CreateContactInput.parse({
			firstname: "John",
			lastname: "Doe",
			email: "john@example.com",
			phone: "+33612345678",
			address_line_1: "1 Rue de Paris",
			city: "Paris",
			zip: "75001",
			country: "FR",
		});
		expect(result.firstname).toBe("John");
	});
	it("accepts with optional fields", () => {
		const result = CreateContactInput.parse({
			firstname: "John",
			lastname: "Doe",
			email: "john@example.com",
			phone: "+33612345678",
			address_line_1: "1 Rue de Paris",
			city: "Paris",
			zip: "75001",
			country: "FR",
			company_name: "ACME",
			state: "IDF",
		});
		expect(result.company_name).toBe("ACME");
	});
	it("rejects invalid email", () => {
		expect(() =>
			CreateContactInput.parse({
				firstname: "John",
				lastname: "Doe",
				email: "not-email",
				phone: "+33612345678",
				address_line_1: "1 Rue de Paris",
				city: "Paris",
				zip: "75001",
				country: "FR",
			}),
		).toThrow();
	});
	it("rejects country code not 2 chars", () => {
		expect(() =>
			CreateContactInput.parse({
				firstname: "John",
				lastname: "Doe",
				email: "john@example.com",
				phone: "+33612345678",
				address_line_1: "1 Rue de Paris",
				city: "Paris",
				zip: "75001",
				country: "FRA",
			}),
		).toThrow();
	});
});

describe("UpdateContactInput", () => {
	it("accepts minimal input", () => {
		const result = UpdateContactInput.parse({ contact_id: "c-1" });
		expect(result.contact_id).toBe("c-1");
	});
	it("accepts all optional fields", () => {
		const result = UpdateContactInput.parse({
			contact_id: "c-1",
			firstname: "Jane",
			lastname: "Doe",
			email: "jane@example.com",
			phone: "+33612345678",
			company_name: "Corp",
			address_line_1: "2 Rue",
			city: "Lyon",
			zip: "69001",
			country: "FR",
			state: "ARA",
		});
		expect(result.firstname).toBe("Jane");
	});
	it("rejects invalid country length", () => {
		expect(() => UpdateContactInput.parse({ contact_id: "c-1", country: "FRA" })).toThrow();
	});
});

describe("ListTldsInput", () => {
	it("applies defaults", () => {
		const result = ListTldsInput.parse({});
		expect(result.page).toBe(1);
		expect(result.page_size).toBe(50);
	});
	it("rejects invalid page_size", () => {
		expect(() => ListTldsInput.parse({ page_size: 0 })).toThrow();
	});
});

describe("GetTldInput", () => {
	it("accepts valid tld_name", () => {
		expect(GetTldInput.parse({ tld_name: "com" }).tld_name).toBe("com");
	});
	it("rejects empty tld_name", () => {
		expect(() => GetTldInput.parse({ tld_name: "" })).toThrow();
	});
});
