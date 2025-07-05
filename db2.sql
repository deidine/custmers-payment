-- Table: public.customers

-- DROP TABLE IF EXISTS public.customers;

CREATE TABLE IF NOT EXISTS public.customers
(
    customer_id integer NOT NULL DEFAULT nextval('customers_customer_id_seq'::regclass),
    uuid uuid DEFAULT gen_random_uuid(),
    phone_number character varying(20) COLLATE pg_catalog."default" NOT NULL,
    email character varying(50) COLLATE pg_catalog."default",
    address character varying(255) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    first_name character varying(50) COLLATE pg_catalog."default",
    last_name character varying(50) COLLATE pg_catalog."default",
    gender character varying(10) COLLATE pg_catalog."default",
    date_of_birth date,
    emergency_contact character varying(50) COLLATE pg_catalog."default",
    emergency_phone character varying(20) COLLATE pg_catalog."default",
    street_address character varying(255) COLLATE pg_catalog."default",
    city character varying(100) COLLATE pg_catalog."default",
    state character varying(100) COLLATE pg_catalog."default",
    state_code character varying(10) COLLATE pg_catalog."default",
    membership_type character varying(50) COLLATE pg_catalog."default",
    membership_start_date date,
    membership_end_date date,
    status character varying(50) COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    price_to_pay bigint,
    CONSTRAINT customers_pkey PRIMARY KEY (customer_id),
    CONSTRAINT customers_uuid_key UNIQUE (uuid),
    CONSTRAINT unique_phone_number UNIQUE (phone_number)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.customers
    OWNER to postgres;


    -- Table: public.payments

-- DROP TABLE IF EXISTS public.payments;

CREATE TABLE IF NOT EXISTS public.payments
(
    payment_id integer NOT NULL DEFAULT nextval('payments_payment_id_seq'::regclass),
    payment_method character varying(20) COLLATE pg_catalog."default" DEFAULT 'Cash'::character varying,
    total_amount numeric(10,2) NOT NULL DEFAULT 0,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    customer_id integer,
    amount numeric(10,2),
    status character varying(20) COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    receipt_number character varying(50) COLLATE pg_catalog."default",
    invoice_number character varying(50) COLLATE pg_catalog."default",
    transaction_reference character varying(100) COLLATE pg_catalog."default",
    created_by integer,
    CONSTRAINT payments_pkey PRIMARY KEY (payment_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.payments
    OWNER to postgres;




    -- Table: public.sessions

-- DROP TABLE IF EXISTS public.sessions;

CREATE TABLE IF NOT EXISTS public.sessions
(
    id integer NOT NULL DEFAULT nextval('sessions_id_seq'::regclass),
    uuid uuid DEFAULT gen_random_uuid(),
    user_uuid uuid NOT NULL,
    token text COLLATE pg_catalog."default" NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sessions_pkey PRIMARY KEY (id),
    CONSTRAINT sessions_uuid_key UNIQUE (uuid),
    CONSTRAINT fk_sessions_user_uuid FOREIGN KEY (user_uuid)
        REFERENCES public.users (uuid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.sessions
    OWNER to postgres;
-- Index: idx_sessions_token

-- DROP INDEX IF EXISTS public.idx_sessions_token;

CREATE INDEX IF NOT EXISTS idx_sessions_token
    ON public.sessions USING btree
    (token COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_sessions_user_uuid

-- DROP INDEX IF EXISTS public.idx_sessions_user_uuid;

CREATE INDEX IF NOT EXISTS idx_sessions_user_uuid
    ON public.sessions USING btree
    (user_uuid ASC NULLS LAST)
    TABLESPACE pg_default;





    -- Table: public.user_profiles

-- DROP TABLE IF EXISTS public.user_profiles;

CREATE TABLE IF NOT EXISTS public.user_profiles
(
    profile_id integer NOT NULL DEFAULT nextval('user_profiles_profile_id_seq'::regclass),
    user_uuid uuid,
    full_name character varying(100) COLLATE pg_catalog."default",
    birth_date date,
    address text COLLATE pg_catalog."default",
    phone_number character varying(20) COLLATE pg_catalog."default",
    profile_picture_url character varying(255) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_profiles_pkey PRIMARY KEY (profile_id),
    CONSTRAINT user_profiles_user_uuid_fkey FOREIGN KEY (user_uuid)
        REFERENCES public.users (uuid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.user_profiles
    OWNER to postgres;
-- Index: idx_user_profiles_user_uuid

-- DROP INDEX IF EXISTS public.idx_user_profiles_user_uuid;

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_uuid
    ON public.user_profiles USING btree
    (user_uuid ASC NULLS LAST)
    TABLESPACE pg_default;




    -- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
    uuid uuid DEFAULT gen_random_uuid(),
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(200) COLLATE pg_catalog."default" NOT NULL,
    role character varying(20) COLLATE pg_catalog."default" DEFAULT 'CUSTOMER'::character varying,
    is_enabled boolean NOT NULL DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_uuid_key UNIQUE (uuid)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;
-- Index: idx_users_uuid

-- DROP INDEX IF EXISTS public.idx_users_uuid;

CREATE INDEX IF NOT EXISTS idx_users_uuid
    ON public.users USING btree
    (uuid ASC NULLS LAST)
    TABLESPACE pg_default;