import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Settings, Shield, CheckCircle, XCircle, Info } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#fdfbf6]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-lg opacity-90">
            Learn how BidSphere uses cookies to enhance your experience and keep our platform secure.
          </p>
          <p className="text-sm opacity-75 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* What are Cookies */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Cookie className="w-6 h-6 text-orange-600" />
            What Are Cookies?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Cookies are small text files stored on your device when you visit websites. They help us 
            provide better services by remembering your preferences and improving site functionality.
          </p>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-gray-700">
              <strong>Think of cookies as memory cards</strong> for websites - they remember who you are, 
              what you like, and help us personalize your experience on BidSphere.
            </p>
          </div>
        </div>

        {/* Types of Cookies We Use */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-orange-600" />
            Types of Cookies We Use
          </h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-lg">Essential Cookies</h3>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Required</span>
              </div>
              <p className="text-gray-600 mb-2">These cookies are necessary for our platform to function properly.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• User authentication and session management</li>
                <li>• Security tokens and fraud prevention</li>
                <li>• Shopping cart and bidding functionality</li>
                <li>• Load balancing and site stability</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Performance Cookies</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Optional</span>
              </div>
              <p className="text-gray-600 mb-2">These cookies help us understand how our platform is being used.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Analytics and usage statistics</li>
                <li>• Page load time monitoring</li>
                <li>• Error tracking and bug fixes</li>
                <li>• A/B testing and feature optimization</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-lg">Personalization Cookies</h3>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Optional</span>
              </div>
              <p className="text-gray-600 mb-2">These cookies remember your preferences to enhance your experience.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Language and currency preferences</li>
                <li>• Watchlist and saved searches</li>
                <li>• Personalized recommendations</li>
                <li>• Custom dashboard layout</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-lg">Marketing Cookies</h3>
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Optional</span>
              </div>
              <p className="text-gray-600 mb-2">These cookies help us show you relevant advertisements and content.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Ad campaign performance tracking</li>
                <li>• Personalized advertising</li>
                <li>• Social media integration</li>
                <li>• Cross-site behavioral tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cookie Duration */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookie Duration</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Session Cookies
              </h3>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-gray-600 mb-2">Deleted when you close your browser</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Temporary shopping cart items</li>
                  <li>• Security tokens</li>
                  <li>• Page navigation state</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Persistent Cookies
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-600 mb-2">Remain on your device for a set period</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Login preferences (30 days)</li>
                  <li>• Analytics data (2 years)</li>
                  <li>• Marketing tracking (90 days)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Managing Cookies */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-orange-600" />
            Managing Your Cookie Preferences
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">You Have Control</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Browser Settings</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>Block all cookies or just third-party cookies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>Clear existing cookies when you close browser</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>Set exceptions for trusted sites like BidSphere</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Our Cookie Center</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>Customize cookie preferences anytime</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>Withdraw consent for optional cookies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>View detailed cookie information</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-800 mb-1">Important Note</h4>
                  <p className="text-gray-700 text-sm">
                    Blocking essential cookies may prevent you from using some features of BidSphere, 
                    such as placing bids or managing your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third-Party Cookies */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              We work with trusted third-party services that may place cookies on your device:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Payment Processors</h4>
                <p className="text-sm text-gray-600">Secure payment processing and fraud prevention</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Analytics Services</h4>
                <p className="text-sm text-gray-600">Google Analytics for website improvement</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Social Media</h4>
                <p className="text-sm text-gray-600">Sharing buttons and social login integration</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Advertising Partners</h4>
                <p className="text-sm text-gray-600">Relevant ad delivery and campaign tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Cookie Rights</h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Right to Information</h4>
                <p className="text-gray-600 text-sm">Know exactly what cookies we use and why</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Right to Consent</h4>
                <p className="text-gray-600 text-sm">Choose which optional cookies to accept</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Right to Withdraw</h4>
                <p className="text-gray-600 text-sm">Change your cookie preferences at any time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Updates to Policy */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
          <p className="text-gray-600">
            We may update this cookie policy from time to time to reflect changes in our practices 
            or for other operational, legal, or regulatory reasons. We will notify you of any 
            significant changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Questions About Cookies?</h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about our use of cookies or need help managing your preferences, 
            our support team is here to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Contact Support
            </Link>
            <Link 
              to="/help" 
              className="bg-white text-orange-600 border border-orange-600 px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
