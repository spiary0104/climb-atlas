


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."pin_community_submission"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $_$
begin
  if auth.uid() is not null then
    new.created_at   := now();
    new.updated_at   := now();
    new.community    := true;
    new.edited       := false;
    new.status       := 'pending';
    new.submitted_by := auth.uid();
    -- Client ids must look like our own 'community-<uuid>' scheme; anything
    -- else (an injected string, a spoofed 'seed-N') is replaced server-side.
    if new.id is null or new.id !~ '^community-[0-9a-f-]{36}$' then
      new.id := 'community-' || gen_random_uuid()::text;
    end if;
  end if;
  return new;
end;
$_$;


ALTER FUNCTION "public"."pin_community_submission"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recent_submission_count"() RETURNS integer
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select count(*)::integer from public.spots
  where submitted_by = auth.uid()
    and created_at > now() - interval '1 day';
$$;


ALTER FUNCTION "public"."recent_submission_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."touch_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."marks" (
    "user_id" "uuid" NOT NULL,
    "spot_id" "text" NOT NULL,
    "mark_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "marks_mark_type_check" CHECK (("mark_type" = ANY (ARRAY['climbed'::"text", 'bookmarked'::"text"])))
);


ALTER TABLE "public"."marks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moderators" (
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."moderators" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pending_edits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "spot_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "suburb" "text" NOT NULL,
    "state" "text" NOT NULL,
    "country" "text" NOT NULL,
    "lat" double precision NOT NULL,
    "lng" double precision NOT NULL,
    "types" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "notes" "text",
    "photo" "text",
    "address" "text",
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pending_edits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "spot_id" "text" NOT NULL,
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."routes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "spot_id" "text" NOT NULL,
    "name" "text",
    "climb_type" "text" NOT NULL,
    "grade" "text" NOT NULL,
    "grade_system" "text" DEFAULT 'v-scale'::"text" NOT NULL,
    "color" "text",
    "wall_section" "text",
    "setter" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "photo" "text",
    "submitted_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "routes_climb_type_check" CHECK (("climb_type" = ANY (ARRAY['indoor-bouldering'::"text", 'top-rope'::"text", 'lead-climbing'::"text"]))),
    CONSTRAINT "routes_grade_system_check" CHECK (("grade_system" = ANY (ARRAY['v-scale'::"text", 'yds'::"text", 'french'::"text", 'font'::"text"])))
);


ALTER TABLE "public"."routes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session_climbs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "route_id" "uuid",
    "climb_type" "text" NOT NULL,
    "grade" "text" NOT NULL,
    "grade_system" "text" DEFAULT 'v-scale'::"text" NOT NULL,
    "attempts" integer DEFAULT 1 NOT NULL,
    "sent" boolean DEFAULT true NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "session_climbs_climb_type_check" CHECK (("climb_type" = ANY (ARRAY['indoor-bouldering'::"text", 'top-rope'::"text", 'lead-climbing'::"text"]))),
    CONSTRAINT "session_climbs_grade_system_check" CHECK (("grade_system" = ANY (ARRAY['v-scale'::"text", 'yds'::"text", 'french'::"text", 'font'::"text"])))
);


ALTER TABLE "public"."session_climbs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "spot_id" "text",
    "session_date" "date" NOT NULL,
    "mood" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "sessions_mood_check" CHECK (("mood" = ANY (ARRAY['great'::"text", 'good'::"text", 'ok'::"text", 'tired'::"text", 'rough'::"text"])))
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."spots" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "suburb" "text" NOT NULL,
    "state" "text" NOT NULL,
    "lat" double precision NOT NULL,
    "lng" double precision NOT NULL,
    "types" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "notes" "text",
    "photo" "text",
    "community" boolean DEFAULT false NOT NULL,
    "edited" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "country" "text" DEFAULT 'AU'::"text" NOT NULL,
    "status" "text" DEFAULT 'approved'::"text" NOT NULL,
    "address" "text",
    "submitted_by" "uuid",
    CONSTRAINT "spots_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text"])))
);


ALTER TABLE "public"."spots" OWNER TO "postgres";


ALTER TABLE ONLY "public"."marks"
    ADD CONSTRAINT "marks_pkey" PRIMARY KEY ("user_id", "spot_id", "mark_type");



ALTER TABLE ONLY "public"."moderators"
    ADD CONSTRAINT "moderators_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."pending_edits"
    ADD CONSTRAINT "pending_edits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routes"
    ADD CONSTRAINT "routes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_climbs"
    ADD CONSTRAINT "session_climbs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spots"
    ADD CONSTRAINT "spots_pkey" PRIMARY KEY ("id");



CREATE INDEX "marks_user_id_idx" ON "public"."marks" USING "btree" ("user_id");



CREATE INDEX "pending_edits_spot_id_idx" ON "public"."pending_edits" USING "btree" ("spot_id");



CREATE INDEX "reports_spot_id_idx" ON "public"."reports" USING "btree" ("spot_id");



CREATE INDEX "routes_spot_id_idx" ON "public"."routes" USING "btree" ("spot_id");



CREATE INDEX "session_climbs_route_id_idx" ON "public"."session_climbs" USING "btree" ("route_id");



CREATE INDEX "session_climbs_session_id_idx" ON "public"."session_climbs" USING "btree" ("session_id");



CREATE INDEX "sessions_spot_id_idx" ON "public"."sessions" USING "btree" ("spot_id");



CREATE INDEX "sessions_user_id_idx" ON "public"."sessions" USING "btree" ("user_id");



CREATE INDEX "spots_status_idx" ON "public"."spots" USING "btree" ("status");



CREATE INDEX "spots_submitted_by_created_at_idx" ON "public"."spots" USING "btree" ("submitted_by", "created_at");



CREATE OR REPLACE TRIGGER "spots_pin_community_submission" BEFORE INSERT ON "public"."spots" FOR EACH ROW EXECUTE FUNCTION "public"."pin_community_submission"();



CREATE OR REPLACE TRIGGER "spots_touch_updated_at" BEFORE UPDATE ON "public"."spots" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



ALTER TABLE ONLY "public"."marks"
    ADD CONSTRAINT "marks_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "public"."spots"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marks"
    ADD CONSTRAINT "marks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moderators"
    ADD CONSTRAINT "moderators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pending_edits"
    ADD CONSTRAINT "pending_edits_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "public"."spots"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "public"."spots"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routes"
    ADD CONSTRAINT "routes_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "public"."spots"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routes"
    ADD CONSTRAINT "routes_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."session_climbs"
    ADD CONSTRAINT "session_climbs_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."session_climbs"
    ADD CONSTRAINT "session_climbs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "public"."spots"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spots"
    ADD CONSTRAINT "spots_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "auth"."users"("id");



CREATE POLICY "anyone can propose an edit" ON "public"."pending_edits" FOR INSERT WITH CHECK (true);



CREATE POLICY "anyone can submit a report" ON "public"."reports" FOR INSERT WITH CHECK (true);



CREATE POLICY "approved spots are publicly readable, moderators see all, submi" ON "public"."spots" FOR SELECT USING ((("status" = 'approved'::"text") OR ("auth"."uid"() IN ( SELECT "moderators"."user_id"
   FROM "public"."moderators")) OR ("submitted_by" = "auth"."uid"())));



ALTER TABLE "public"."marks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."moderators" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "moderators can delete spots" ON "public"."spots" FOR DELETE USING (("auth"."uid"() IN ( SELECT "moderators"."user_id"
   FROM "public"."moderators")));



CREATE POLICY "moderators can dismiss reports" ON "public"."reports" FOR DELETE USING (("auth"."uid"() IN ( SELECT "moderators"."user_id"
   FROM "public"."moderators")));



CREATE POLICY "moderators can remove pending edits" ON "public"."pending_edits" FOR DELETE USING (("auth"."uid"() IN ( SELECT "moderators"."user_id"
   FROM "public"."moderators")));



CREATE POLICY "moderators can update spots" ON "public"."spots" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "moderators"."user_id"
   FROM "public"."moderators")));



CREATE POLICY "moderators can view pending edits" ON "public"."pending_edits" FOR SELECT USING (("auth"."uid"() IN ( SELECT "moderators"."user_id"
   FROM "public"."moderators")));



CREATE POLICY "moderators can view reports" ON "public"."reports" FOR SELECT USING (("auth"."uid"() IN ( SELECT "moderators"."user_id"
   FROM "public"."moderators")));



ALTER TABLE "public"."pending_edits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."routes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "routes are publicly readable" ON "public"."routes" FOR SELECT USING (true);



ALTER TABLE "public"."session_climbs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "signed-in users can add routes" ON "public"."routes" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("submitted_by" = "auth"."uid"())));



CREATE POLICY "signed-in users can propose a new spot as pending, rate-limited" ON "public"."spots" FOR INSERT WITH CHECK ((("status" = 'pending'::"text") AND ("auth"."uid"() IS NOT NULL) AND ("submitted_by" = "auth"."uid"()) AND ("public"."recent_submission_count"() < 10)));



ALTER TABLE "public"."spots" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "submitter or moderator can delete a route" ON "public"."routes" FOR DELETE USING ((("submitted_by" = "auth"."uid"()) OR ("auth"."uid"() IN ( SELECT "moderators"."user_id"
   FROM "public"."moderators"))));



CREATE POLICY "submitter or moderator can update a route" ON "public"."routes" FOR UPDATE USING ((("submitted_by" = "auth"."uid"()) OR ("auth"."uid"() IN ( SELECT "moderators"."user_id"
   FROM "public"."moderators"))));



CREATE POLICY "users can add climbs to their own sessions" ON "public"."session_climbs" FOR INSERT WITH CHECK (("session_id" IN ( SELECT "sessions"."id"
   FROM "public"."sessions"
  WHERE ("sessions"."user_id" = "auth"."uid"()))));



CREATE POLICY "users can add their own marks" ON "public"."marks" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "users can add their own sessions" ON "public"."sessions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "users can check their own moderator status" ON "public"."moderators" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users can delete climbs on their own sessions" ON "public"."session_climbs" FOR DELETE USING (("session_id" IN ( SELECT "sessions"."id"
   FROM "public"."sessions"
  WHERE ("sessions"."user_id" = "auth"."uid"()))));



CREATE POLICY "users can delete their own sessions" ON "public"."sessions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users can remove their own marks" ON "public"."marks" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users can update climbs on their own sessions" ON "public"."session_climbs" FOR UPDATE USING (("session_id" IN ( SELECT "sessions"."id"
   FROM "public"."sessions"
  WHERE ("sessions"."user_id" = "auth"."uid"()))));



CREATE POLICY "users can update their own sessions" ON "public"."sessions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users can view climbs on their own sessions" ON "public"."session_climbs" FOR SELECT USING (("session_id" IN ( SELECT "sessions"."id"
   FROM "public"."sessions"
  WHERE ("sessions"."user_id" = "auth"."uid"()))));



CREATE POLICY "users can view their own marks" ON "public"."marks" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users can view their own sessions" ON "public"."sessions" FOR SELECT USING (("auth"."uid"() = "user_id"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."pin_community_submission"() TO "anon";
GRANT ALL ON FUNCTION "public"."pin_community_submission"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."pin_community_submission"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."recent_submission_count"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."recent_submission_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."recent_submission_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."recent_submission_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."marks" TO "anon";
GRANT ALL ON TABLE "public"."marks" TO "authenticated";
GRANT ALL ON TABLE "public"."marks" TO "service_role";



GRANT ALL ON TABLE "public"."moderators" TO "anon";
GRANT ALL ON TABLE "public"."moderators" TO "authenticated";
GRANT ALL ON TABLE "public"."moderators" TO "service_role";



GRANT ALL ON TABLE "public"."pending_edits" TO "anon";
GRANT ALL ON TABLE "public"."pending_edits" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_edits" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."routes" TO "anon";
GRANT ALL ON TABLE "public"."routes" TO "authenticated";
GRANT ALL ON TABLE "public"."routes" TO "service_role";



GRANT ALL ON TABLE "public"."session_climbs" TO "anon";
GRANT ALL ON TABLE "public"."session_climbs" TO "authenticated";
GRANT ALL ON TABLE "public"."session_climbs" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON TABLE "public"."spots" TO "anon";
GRANT ALL ON TABLE "public"."spots" TO "authenticated";
GRANT ALL ON TABLE "public"."spots" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







