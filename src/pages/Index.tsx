import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import RoomsSection from "@/components/RoomsSection";
import AmenitiesSection from "@/components/AmenitiesSection";
import LocationSection from "@/components/LocationSection";
import ReviewsSection from "@/components/ReviewsSection";
import GallerySection from "@/components/GallerySection";
import BookingSection from "@/components/BookingSection";
import ContactSection from "@/components/ContactSection";
import FloatingButtons from "@/components/FloatingButtons";
import Footer from "@/components/Footer";
import GoogleBusinessButtons from "@/components/GoogleBusinessButtons";
import FAQSection from "@/components/FAQSection";

const Index = () => (
  <>
    <Navbar />
    <HeroSection />
    <AboutSection />
    <RoomsSection />
    <AmenitiesSection />
    <LocationSection />
    <GoogleBusinessButtons />
    <ReviewsSection />
    <GallerySection />
    <BookingSection />
    <FAQSection />
    <ContactSection />
    <Footer />
    <FloatingButtons />
  </>
);

export default Index;
