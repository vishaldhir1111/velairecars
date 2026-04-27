import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Car,
  CalendarDays,
  ShieldCheck,
  Phone,
  MessageCircle,
  Search,
  Gauge,
  Fuel,
  Settings,
  CreditCard,
  Star,
  MapPin,
  Mail,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "447845589543";
const BUSINESS_NAME = "Velaire Cars";
const BUSINESS_ADDRESS = "42 Bell Road, Hounslow TW3 3PB, UK";
const BUSINESS_PHONE = "+44 7845 589543";
const BUSINESS_EMAIL = "info@velairecars.co.uk";

const vehicles = [
  {
    id: 1,
    type: "Rental",
    make: "Tesla",
    model: "Model 3 Performance",
    year: 2020,
    colour: "White exterior / white interior",
    price: "Enquire for rental rates",
    salePrice: null,
    highlight: "Electric performance saloon with premium white cabin.",
    urgency: "High demand this week",
    fuel: "Electric",
    gearbox: "Auto",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1400&auto=format&fit=crop",
    badge: "White Interior",
  },
  {
    id: 2,
    type: "Sale",
    make: "BMW",
    model: "M140i M Sport",
    year: 2019,
    colour: "Black exterior with kit",
    price: null,
    salePrice: "Enquire to buy",
    highlight: "Performance hatch with aggressive styling kit.",
    urgency: "Serious enquiries only",
    fuel: "Petrol",
    gearbox: "Auto",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1400&auto=format&fit=crop",
    badge: "M Sport Kit",
  },
  {
    id: 3,
    type: "Rental",
    make: "Range Rover",
    model: "SVR",
    year: 2020,
    colour: "Blue exterior",
    price: "Enquire for rental rates",
    salePrice: null,
    highlight: "Luxury performance SUV with serious road presence.",
    urgency: "Weekend enquiries open",
    fuel: "Petrol",
    gearbox: "Auto",
    image:
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1400&auto=format&fit=crop",
    badge: "SVR",
  },
  {
    id: 4,
    type: "Rental",
    make: "Mercedes-Benz",
    model: "G63 AMG",
    year: 2019,
    colour: "Grey exterior",
    price: "Enquire for rental rates",
    salePrice: null,
    highlight: "Iconic AMG luxury SUV for premium occasions.",
    urgency: "Limited dates",
    fuel: "Petrol",
    gearbox: "Auto",
    image:
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=1400&auto=format&fit=crop",
    badge: "AMG G-Wagon",
  },
  {
    id: 5,
    type: "Rental",
    make: "Bugatti",
    model: "Veyron",
    year: 2008,
    colour: "Hypercar specification",
    price: "POA",
    salePrice: null,
    highlight: "Ultra-exclusive hypercar enquiry for premium clients and events.",
    urgency: "Limited availability",
    fuel: "Petrol",
    gearbox: "Auto",
    image:
      "https://images.unsplash.com/photo-1600712242805-5f78671b24da?q=80&w=1400&auto=format&fit=crop",
    badge: "Hypercar",
  },
  {
    id: 6,
    type: "Rental",
    make: "Tesla",
    model: "Roadster",
    year: 2026,
    colour: "Electric supercar",
    price: "POA",
    salePrice: null,
    highlight: "Rare electric performance icon available by special enquiry.",
    urgency: "Register interest",
    fuel: "Electric",
    gearbox: "Auto",
    image:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1400&auto=format&fit=crop",
    badge: "Special Enquiry",
  },
];

function whatsappLink(vehicle) {
  const message = vehicle
    ? `Hi Velaire Cars, I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}. Is it available?`
    : "Hi Velaire Cars, I'm interested in your luxury car rental/dealership services.";

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function callLink() {
  return `tel:${BUSINESS_PHONE.replace(/\s/g, "")}`;
}

function VehicleCard({ vehicle }) {
  return (
    <Card className="group overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-64 overflow-hidden bg-zinc-100">
        <img
          src={vehicle.image}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-900 backdrop-blur">
          {vehicle.type}
        </div>

        <div className="absolute bottom-4 right-4 rounded-full bg-zinc-950 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
          {vehicle.badge}
        </div>

        {vehicle.urgency && (
          <div className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-zinc-950 shadow-lg">
            {vehicle.urgency}
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
              {vehicle.year}
            </p>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="mt-2 text-sm text-zinc-500">{vehicle.highlight}</p>
          </div>

          <p className="max-w-32 text-right text-base font-black text-zinc-950">
            {vehicle.type === "Rental" ? vehicle.price : vehicle.salePrice}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-zinc-700">
          <div className="rounded-2xl bg-zinc-100 p-3">
            <Gauge className="mb-2 h-4 w-4 text-zinc-950" />
            {vehicle.colour}
          </div>
          <div className="rounded-2xl bg-zinc-100 p-3">
            <Fuel className="mb-2 h-4 w-4 text-zinc-950" />
            {vehicle.fuel}
          </div>
          <div className="rounded-2xl bg-zinc-100 p-3">
            <Settings className="mb-2 h-4 w-4 text-zinc-950" />
            {vehicle.gearbox}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Button className="h-12 rounded-2xl bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
            Details
          </Button>

          <a href={callLink()}>
            <Button className="h-12 w-full rounded-2xl bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
              <Phone className="mr-2 h-4 w-4" /> Call
            </Button>
          </a>

          <a href={whatsappLink(vehicle)} target="_blank" rel="noreferrer">
            <Button className="h-12 w-full rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800">
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CarRentalDealershipMVP() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesFilter = filter === "All" || vehicle.type === filter;
      const query =
        `${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.colour}`.toLowerCase();
      return matchesFilter && query.includes(search.toLowerCase());
    });
  }, [filter, search]);

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <div className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 gap-3 rounded-full border border-zinc-200 bg-white/95 p-2 shadow-2xl backdrop-blur md:left-auto md:right-5 md:w-auto md:translate-x-0">
        <a
          href={callLink()}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-100 px-4 py-3 text-sm font-black text-zinc-950 transition hover:bg-zinc-200 md:flex-none"
        >
          <Phone className="h-5 w-5" /> Call Now
        </a>

        <a
          href={whatsappLink()}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-800 md:flex-none"
        >
          <MessageCircle className="h-5 w-5" /> WhatsApp
        </a>
      </div>

      <section className="relative overflow-hidden border-b border-zinc-200 bg-zinc-950 text-white">
        <div className="absolute inset-0 opacity-35">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1800&auto=format&fit=crop"
            alt="Luxury car background"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/30" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 text-zinc-950">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight">
                  {BUSINESS_NAME}
                </p>
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-300">
                  Luxury Car Rental • Sales • Finance
                </p>
              </div>
            </div>

            <div className="hidden gap-8 text-sm font-semibold text-zinc-300 md:flex">
              <a href="#stock" className="hover:text-white">
                Stock
              </a>
              <a href="#rentals" className="hover:text-white">
                Rentals
              </a>
              <a href="#finance" className="hover:text-white">
                Finance
              </a>
              <a href="#contact" className="hover:text-white">
                Contact
              </a>
            </div>

            <div className="hidden gap-3 md:flex">
              <a href={callLink()}>
                <Button className="rounded-2xl bg-white/10 text-white hover:bg-white/20">
                  <Phone className="mr-2 h-4 w-4" /> Call
                </Button>
              </a>
              <a href={whatsappLink()} target="_blank" rel="noreferrer">
                <Button className="rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200">
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </Button>
              </a>
            </div>
          </nav>

          <div className="grid min-h-[700px] items-center gap-10 py-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur">
                Luxury rental and dealership experience
              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
                Luxury car rental and sales in West London.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
                Explore selected rental vehicles and dealership stock from
                Velaire Cars in Hounslow. Message us on WhatsApp or call now for
                bookings, viewings, finance enquiries and part exchange.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#stock">
                  <Button className="h-12 rounded-2xl bg-white px-6 text-zinc-950 hover:bg-zinc-200">
                    Explore Stock <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href={callLink()}>
                  <Button className="h-12 rounded-2xl border border-white/20 bg-white/10 px-6 text-white hover:bg-white/20">
                    <Phone className="mr-2 h-4 w-4" /> Call Now
                  </Button>
                </a>
                <a href={whatsappLink()} target="_blank" rel="noreferrer">
                  <Button className="h-12 rounded-2xl border border-white/20 bg-white/10 px-6 text-white hover:bg-white/20">
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                  </Button>
                </a>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {[
                  ["6", "Featured Cars"],
                  ["£99", "Reserve Option"],
                  ["Fast", "WhatsApp Replies"],
                ].map(([big, small]) => (
                  <div
                    key={big}
                    className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur"
                  >
                    <p className="text-3xl font-black text-white">{big}</p>
                    <p className="text-sm text-zinc-300">{small}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hidden lg:block"
            >
              <Card className="rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
                <img
                  src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1400&auto=format&fit=crop"
                  alt="Featured car"
                  className="h-[440px] w-full rounded-[1.5rem] object-cover"
                />
                <CardContent className="p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-zinc-300">
                        Featured rental
                      </p>
                      <h2 className="text-2xl font-black text-white">
                        Range Rover SVR
                      </h2>
                    </div>
                    <p className="text-right text-xl font-black text-white">
                      Enquire
                      <br />
                      for rates
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            [
              CalendarDays,
              "Flexible Rentals",
              "Daily, weekly and monthly rental enquiries.",
            ],
            [
              CreditCard,
              "Reserve Option",
              "Reserve a vehicle after checks and confirmation.",
            ],
            [
              ShieldCheck,
              "Verified Process",
              "ID, licence and deposit checks before handover.",
            ],
            [
              Star,
              "Curated Stock",
              "Luxury, performance and prestige vehicles.",
            ],
          ].map(([Icon, title, text]) => (
            <Card
              key={title}
              className="rounded-[2rem] border border-zinc-200 bg-zinc-50 shadow-sm"
            >
              <CardContent className="p-6">
                <Icon className="mb-4 h-7 w-7 text-zinc-950" />
                <h3 className="mb-2 text-lg font-black text-zinc-950">
                  {title}
                </h3>
                <p className="text-sm leading-6 text-zinc-500">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="stock" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 font-bold uppercase tracking-[0.25em] text-zinc-500">
              Velaire Collection
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              Luxury Rentals & Cars For Sale
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-zinc-500">
              Browse the current featured collection. Enquire directly via
              WhatsApp or call for availability, viewings, rental requirements
              and reservations.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex rounded-2xl border border-zinc-200 bg-zinc-100 p-1">
              {["All", "Rental", "Sale"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    filter === item
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-500 hover:text-zinc-950"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-center rounded-2xl border border-zinc-200 bg-zinc-100 px-4">
              <Search className="mr-2 h-4 w-4 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cars..."
                className="h-11 bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-500"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      <section id="finance" className="border-y border-zinc-200 bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">
          <div>
            <p className="mb-2 font-bold uppercase tracking-[0.25em] text-zinc-400">
              Finance & Part Exchange
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              Make an enquiry today.
            </h2>
            <p className="mt-5 max-w-xl leading-8 text-zinc-300">
              Looking to rent, buy, reserve, finance or part exchange? Send a
              quick enquiry and Velaire Cars will respond directly.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Rental and sales enquiries handled directly",
                "Manual approval before payment or handover",
                "Simple WhatsApp process to keep costs low",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="h-5 w-5 text-white" /> {text}
                </div>
              ))}
            </div>
          </div>

          <Card className="rounded-[2rem] border border-white/10 bg-white p-2 shadow-2xl">
            <CardContent className="space-y-4 p-6">
              <input
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-950 outline-none"
                placeholder="Full name"
              />
              <input
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-950 outline-none"
                placeholder="Phone number"
              />
              <input
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-950 outline-none"
                placeholder="Email address"
              />
              <select className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-950 outline-none">
                <option>I'm interested in...</option>
                <option>Renting a car</option>
                <option>Buying a car</option>
                <option>Finance</option>
                <option>Part exchange</option>
              </select>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-950 outline-none"
                placeholder="Message"
              />

              <div className="grid grid-cols-2 gap-3">
                <a href={callLink()}>
                  <Button className="h-12 w-full rounded-2xl bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
                    <Phone className="mr-2 h-4 w-4" /> Call Now
                  </Button>
                </a>
                <a href={whatsappLink()} target="_blank" rel="noreferrer">
                  <Button className="h-12 w-full rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800">
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                  </Button>
                </a>
              </div>

              <p className="text-center text-xs text-zinc-500">
                Lowest-cost setup: enquiries go through call or WhatsApp first,
                forms can be connected later.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 rounded-[2rem] border border-zinc-200 bg-zinc-50 p-8 md:grid-cols-3">
          {[
            [
              Clock,
              "Fast response",
              "Message or call us directly for availability and viewings.",
            ],
            [
              ShieldCheck,
              "Pre-handover checks",
              "Licence, ID and deposit checks before rentals.",
            ],
            [
              Phone,
              "Direct contact",
              "No complicated booking system needed at launch.",
            ],
          ].map(([Icon, title, text]) => (
            <div key={title}>
              <Icon className="mb-4 h-7 w-7 text-zinc-950" />
              <h3 className="text-lg font-black text-zinc-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" className="border-t border-zinc-200 bg-white pb-24 md:pb-8">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-zinc-950 p-3 text-white">
                <Car className="h-5 w-5" />
              </div>
              <p className="text-xl font-black">{BUSINESS_NAME}</p>
            </div>
            <p className="text-sm leading-6 text-zinc-500">
              Premium car rental and dealership services based in Hounslow, West
              London. Luxury vehicles with a direct call and WhatsApp booking
              experience.
            </p>
          </div>

          <div className="space-y-3 text-sm font-semibold text-zinc-600">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-950" />
              {BUSINESS_ADDRESS}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-zinc-950" />
              {BUSINESS_PHONE}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-zinc-950" />
              {BUSINESS_EMAIL}
            </p>
          </div>

          <div className="flex gap-3 md:justify-end">
            <a href={callLink()}>
              <Button className="rounded-2xl bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
                <Phone className="mr-2 h-4 w-4" /> Call
              </Button>
            </a>
            <a href={whatsappLink()} target="_blank" rel="noreferrer">
              <Button className="rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </Button>
            </a>
          </div>
        </div>

        <div className="mx-auto max-w-7xl border-t border-zinc-200 px-6 py-6 text-xs text-zinc-500">
          © 2026 {BUSINESS_NAME}. All rights reserved. Terms • Privacy • Rental
          Policy
        </div>
      </footer>
    </main>
  );
}
