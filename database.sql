-- Database: paymnet

-- DROP DATABASE IF EXISTS paymnet;

CREATE DATABASE paymnet
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;








-- Table: public.attendance

-- DROP TABLE IF EXISTS public.attendance;

CREATE TABLE IF NOT EXISTS public.attendance
(
    attendance_id integer NOT NULL DEFAULT nextval('user_attendance_id_seq'::regclass),
    user_id integer NOT NULL,
    date date NOT NULL,
    status character varying(20) COLLATE pg_catalog."default" NOT NULL,
    check_in_time timestamp without time zone,
    check_out_time timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT attendance_pkey PRIMARY KEY (attendance_id),
    CONSTRAINT attendance_user_id_date_key UNIQUE (user_id, date),
    CONSTRAINT attendance_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT attendance_status_check CHECK (status::text = ANY (ARRAY['PRESENT'::character varying::text, 'ABSENT'::character varying::text, 'ON_LEAVE'::character varying::text]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.attendance
    OWNER to postgres;
-- Index: idx_attendance_date

-- DROP INDEX IF EXISTS public.idx_attendance_date;

CREATE INDEX IF NOT EXISTS idx_attendance_date
    ON public.attendance USING btree
    (date ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_attendance_user_id

-- DROP INDEX IF EXISTS public.idx_attendance_user_id;

CREATE INDEX IF NOT EXISTS idx_attendance_user_id
    ON public.attendance USING btree
    (user_id ASC NULLS LAST)
    TABLESPACE pg_default;






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
    profile_picture_url character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT customers_pkey PRIMARY KEY (customer_id),
    CONSTRAINT customers_uuid_key UNIQUE (uuid),
    CONSTRAINT unique_phone_number UNIQUE (phone_number)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.customers
    OWNER to postgres;








  
  -- Table: public.customes_attendance

-- DROP TABLE IF EXISTS public.customes_attendance;

CREATE TABLE IF NOT EXISTS public.customes_attendance
(
    attendance_id integer NOT NULL DEFAULT nextval('user_attendance_id_seq'::regclass),
    customer_id integer NOT NULL,
    attendance_date date NOT NULL,
    status character varying(20) COLLATE pg_catalog."default" NOT NULL,
    notes text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    poids_now double precision,
    CONSTRAINT customes_attendance_pkey PRIMARY KEY (attendance_id),
    CONSTRAINT fk_client FOREIGN KEY (customer_id)
        REFERENCES public.customers (customer_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT customes_attendance_status_check CHECK (status::text = ANY (ARRAY['PRESENT'::character varying::text, 'ABSENT'::character varying::text, 'CANCELLED'::character varying::text, 'RESCHEDULED'::character varying::text]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.customes_attendance
    OWNER to postgres;
-- Index: idx_customes_attendance_customer_id

-- DROP INDEX IF EXISTS public.idx_customes_attendance_customer_id;

CREATE INDEX IF NOT EXISTS idx_customes_attendance_customer_id
    ON public.customes_attendance USING btree
    (customer_id ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_customes_attendance_date

-- DROP INDEX IF EXISTS public.idx_customes_attendance_date;

CREATE INDEX IF NOT EXISTS idx_customes_attendance_date
    ON public.customes_attendance USING btree
    (attendance_date ASC NULLS LAST)
    TABLESPACE pg_default;






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








  -- Table: public.products

-- DROP TABLE IF EXISTS public.products;

CREATE TABLE IF NOT EXISTS public.products
(
    id integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
    name text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    price numeric(10,2) NOT NULL,
    stock_quantity integer NOT NULL DEFAULT 0,
    category text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT products_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.products
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







-- View: public.vw_user_profiles_view

-- DROP VIEW public.vw_user_profiles_view;

CREATE OR REPLACE VIEW public.vw_user_profiles_view
 AS
 SELECT up.profile_id,
    up.user_uuid,
    up.full_name,
    up.birth_date,
    up.address,
    up.phone_number,
    up.profile_picture_url,
    up.created_at,
    up.updated_at,
    u.username,
    u.role
   FROM user_profiles up
     JOIN users u ON up.user_uuid = u.uuid;

ALTER TABLE public.vw_user_profiles_view
    OWNER TO postgres;




-- View: public.vw_users_with_uuid

-- DROP VIEW public.vw_users_with_uuid;

CREATE OR REPLACE VIEW public.vw_users_with_uuid
 AS
 SELECT users.uuid,
    users.username,
    users.password,
    users.role,
    users.is_enabled,
    users.created_at,
    users.updated_at
   FROM users;

ALTER TABLE public.vw_users_with_uuid
    OWNER TO postgres;


 