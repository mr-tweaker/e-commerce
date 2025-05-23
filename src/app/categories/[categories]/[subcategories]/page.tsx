"use client";
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { BreadcrumbWithCustomSeparator } from "@/components/breadcrumb";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import MainFooter from "@/components/footer";
import { SelectDemo } from "@/components/select";
import { Separator } from "@/components/ui/separator";
import fcard from "@/components/filters-category/filterCard";
import Fcard from "@/components/filters-category/filterCard";
import { PaginationComponent } from "@/components/pagination";

import {
  getProductsByCategory,
  getProductsByCategoryFiltered,
  getProductsByCategoryfiltered,
} from "@/actions/createProduct";

import CategoriesRelatedProduct from "@/components/categories/CategoriesRelatedProduct";
import { useToast } from "@/components/ui/use-toast";
import LoadingAnimation from "@/components/Loading/LoadingAnimation";

const Page = ({ params }: { params: { subcategories: string } }) => {
  const [currentPage, setCurrentPage] = useState(() => {
    const storedPage = localStorage.getItem("currentPage");
    return storedPage ? parseInt(storedPage, 10) : 1;
  });
  const [filterVisible, setFilterVisible] = useState(false); // Add this state variable
  const [productsFound, setProductsFound] = useState(true);

  const [paginatedData, setPaginatedData] = useState({
    products: [],
    totalPages: 0,
    totalProductsCount: 0,
    currentProductsCount: 0,
  });

  const [categoryName, setSelectedCategoryName] = useState([]);
  const [parentCategoryName, setparentCategoryName] = useState(
    params.subcategories
  );

  const [loading, setLoading] = useState(false); // Added loading state

  const [brandSelected, setBrandSelected] = useState(false);

  const [brandName, setBrandName] = useState([]);
  // console.log("this is brand name", brandName)
  const [minDiscountedPrice, setMinDiscountedPrice] = useState(0);
  const [maxDiscountedPrice, setMaxDiscountedPrice] = useState(100000);
  const [minDiscountPercentage, setMinDiscountPercentage] = useState(0);
  // console.log("this is the minimum and maximum discount price", minDiscountedPrice, maxDiscountedPrice)
  
  const [maxDiscountPercentage, setMaxDiscountPercentage] = useState(100);
  const [filterData, setFilterData] = useState([]);
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    const storedPage = localStorage.getItem("currentPage");
    if (storedPage) {
      setCurrentPage(parseInt(storedPage, 10));
    }
  }, []);

  // Save current page to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("currentPage", currentPage.toString());
  }, [currentPage]);

  // console.log("this is the parent category name", parentCategoryName);
  
  useEffect(() => {
    const fetchPaginatedData = async () => {
      setLoading(true); // Start loading

        // alert("fetching data")
      // console.log("this is the minimum discount price", minDiscountedPrice)
      const data = await getProductsByCategoryFiltered(
        parentCategoryName ,
        categoryName,
        brandName,
        minDiscountedPrice,
        maxDiscountedPrice,
        minDiscountPercentage,
        maxDiscountPercentage,
        currentPage,
        9
      );
      // console.log("this is the data", data)
      setProductsFound(data.products.length > 0 ? true : false);

      setPaginatedData({
        products: data.products,
        totalPages: data.totalPages,
        totalProductsCount: data.totalProducts,
        currentProductsCount: data.products.length,
      });

      const newFilterData = [
        // {
        //   category: "Category",
        //   options: data.uniqueCategories
        //     .filter((category) => !["jewellery", "watches"].includes(category)) // Filter out categories with certain names
        //     .map((category) => ({
        //       label: category,
        //       value: category,
        //     })),
        // },
        {
          category: "Brand",
          options: !brandSelected
            ? data.uniqueBrands.map((brand) => ({
                label: brand,
                value: brand,
              }))
            : filterData.find((item) => item.category === "Brand").options,
        },
        {
          category: "Price",
          options: data.priceRanges.map((range) => ({
            label: range.label,
            value: range.value,
            min: range.min,
            max: range.max,
          })),
        },
        {
          category: "Discount",
          options: data.discountRanges.map((range) => ({
            label: range.label,
            value: range.value,
            min: range.min,
            max: range.max,
          })),
        },
      ];
      setFilterData(newFilterData);
      // Construct the query parameters
    const queryParams = new URLSearchParams();

    // if (brandName) queryParams.set('brandName', brandName);
    // if (minDiscountedPrice) queryParams.set('minDiscountedPrice', minDiscountedPrice);
    // if (maxDiscountedPrice) queryParams.set('maxDiscountedPrice', maxDiscountedPrice);
    // if (minDiscountPercentage) queryParams.set('minDiscountPercentage', minDiscountPercentage);
    // if (maxDiscountPercentage) queryParams.set('maxDiscountPercentage', maxDiscountPercentage);

    // // Update the browser's URL with the new query parameters
    // this is causing to re render the data with back to the same page when using the pagination
    // const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
    // window.history.replaceState(null, '', newUrl);
    setLoading(false); // End loading

    };
    // console.log("hello")
    fetchPaginatedData();
  }, [
    currentPage,
    categoryName,
    brandName,
    minDiscountedPrice,
    maxDiscountedPrice,
    minDiscountPercentage,
    maxDiscountPercentage,
    sortBy
  ]);

  const completeUrl = typeof window !== "undefined" ? window.location.href : "";
  const segments = completeUrl.split("/");
  const previousSegment = segments[segments.length - 1];
  const previousSegment1 = segments[segments.length - 2];
  // console.log("this is the Previous segment:", previousSegment);
  const breadcrumbsData = [
    { id: 1, href: "/", label: "Home" },
    { id: 2, href: `/categories/${previousSegment1}`, label: previousSegment1 },
    { id: 3, href: `/categories/${previousSegment1}/${previousSegment}`, label: previousSegment.split('?')[0] },
    // { id: 4, href: params?.product, label: data?.name },
  ];

  
// Define total number of products and products per page
const totalProducts = paginatedData.totalProductsCount;
const productsPerPage = 9;

// Function to calculate start and end indexes of products to display
const calculateProductRange = (currentPage) => {
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = Math.min(startIndex + productsPerPage - 1, totalProducts - 1);
  return { start: startIndex, end: endIndex };
};
const { start, end } = calculateProductRange(currentPage);

const { toast } = useToast();

const callToast = ({ variant, title, description }) => {
  // alert("toast is being  called")
  toast({
    variant: variant,
    title: title,
    description: description,
  });
};

  return (
    <div className=" overflow-hidden ">
      {/* <div className="fixed top-0 left-0 right-0  z-10">
        <MainNav />
      </div> */}

      <div className=" mt-[8rem]">
        <BreadcrumbWithCustomSeparator items={breadcrumbsData} />
        <div className="filter flex justify-between w-full px-5 mt-5  overflow-hidden relative">
        <div className=" h-[4rem]">
            <h1
              onClick={() => setFilterVisible(!filterVisible)} // Add this onClick handler
              className="w-40 below-700:w-28  below-700:text-[0.8rem] p-2 border-2 border-black text-black mt-4  self-center justify-center border-b-8 border-r-4  bg-pink-500 font-bold  below-695:flex hidden"
            >
              FILTERS
            </h1>          </div>
            <div>
            <div className="  mb-2 ">
            <h1 className=" text-[1.5rem] below-700:text-[0.8rem] below-600:hidden uppercase  p-2 border-2 border-black text-black mt-4 flex self-center justify-center border-b-8 border-r-4 bg-yellow-500 font-bold">
                {`SHOWING  ${start + 1} to ${
                  end + 1
                } out of ${totalProducts} products`}{" "}
              </h1>
            </div>
          </div>
          <div className=" px-5 py-5 flex w-[19rem] justify-between ">
            {/* <h1 className=" self-center font-bold">SORT BY :</h1> */}
            <SelectDemo setSortBy={setSortBy} />
          </div>
        
        </div>
        <div className="  mb-2 ">
          <h1 className=" text-[1.5rem] below-700:text-[0.8rem] below-600:flex hidden uppercase  p-2 border-2 border-black text-black mt-4  self-center justify-center border-b-8 border-r-4 bg-yellow-500 font-bold">
            {`SHOWING  ${start + 1} to ${
              end + 1
            } out of ${totalProducts} products`}{" "}
          </h1>
        </div>
        <Separator />
        <div className=" flex justify-between below-695:hidden ">
        <div className="filterCategorysection flex-none w-1/5 border-r  below-1000:w-[12rem] ">
        {filterData
              .filter(
                (category) => category !== null && category.options.length > 0
              ) // Filter out null categories and those without options
              .map((category, index) => (
                <Fcard
                key={index}
                category={category}
                setBrandSelected={setBrandSelected}
                setSelectedCategoryName={setSelectedCategoryName}
                setBrandName={setBrandName}
                setMinDiscountedPrice={setMinDiscountedPrice}
                setMaxDiscountedPrice={setMaxDiscountedPrice}
                setMinDiscountPercentage={setMinDiscountPercentage}
                setMaxDiscountPercentage={setMaxDiscountPercentage}
              />
              ))}
          </div>

          <div className="productsRight flex-grow">
            <div className={`min-h-[90vh] `}>
        
            {productsFound === false ? (
                <div className=" text-center self-center">
                  <h1 className=" text-[4rem]  below-1000:text-[2rem] below-695:text-[1rem] uppercase ">
                    No Products found Lmao 😂
                  </h1>
                  <h1 className=" text-[4rem] below-1000:text-[2rem]  below-695:text-[1rem] uppercase  ">
                    What you Filtering ?
                  </h1>
                  <h1 className=" text-[4rem] below-1000:text-[2rem]  below-695:text-[1rem] uppercase ">
                    Search again Bruh...
                  </h1>
                </div>
              ) : paginatedData.products?.length === 0 ? (
                <div className=" h-screen  flex items-center justify-center">
                  <LoadingAnimation />
                </div>
              ) :(
                <div>
               {loading ? (<>
                <div className=" h-screen  flex items-center justify-center">
                <LoadingAnimation />
                </div>
                </>) : (<CategoriesRelatedProduct
              key={paginatedData.products.id}
                relatedProduct={paginatedData.products}
                callToast={callToast}
              />)
            }
              
            </div>
 )}
            </div>
            <div className=" h-[4rem] ">
              <PaginationComponent
                currentOrderPage={currentPage}
                totalPages={paginatedData.totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
        </div>

        <div
          className={` justify-between below-695:flex hidden transition-all duration-500 ${
            filterVisible ? "ml-0" : "-ml-full"
          }`}
        >
          <div
            className={`filterCategorysection flex-none w-1/5 border-r below-1000:w-[12rem]  transition-all duration-500 ${
              filterVisible ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {filterData.map((category, index) => (
              <Fcard
                key={index}
                category={category}
                setBrandSelected={setBrandSelected}
                setSelectedCategoryName={setSelectedCategoryName}
                setBrandName={setBrandName}
                setMinDiscountedPrice={setMinDiscountedPrice}
                setMaxDiscountedPrice={setMaxDiscountedPrice}
                setMinDiscountPercentage={setMinDiscountPercentage}
                setMaxDiscountPercentage={setMaxDiscountPercentage}
              />
            ))}
          </div>

          <div
            className={`productsRight  below-445:hidden  below-378:hidden flex-grow   transition-all duration-500 ${
              filterVisible ? "ml-[0vw]" : "ml-[-40vw] "
            }`}
          >
            <div className={`min-h-[90vh] `}>
              {productsFound === false ? (
                <div className=" text-center self-center">
                  <h1 className=" text-[4rem] below-1000:text-[2rem] below-695:text-[1rem] uppercase ">
                    No Products found Lmao 😂
                  </h1>
                  <h1 className=" text-[4rem] below-1000:text-[2rem] below-695:text-[1rem] uppercase  ">
                    What you Filtering ?
                  </h1>
                  <h1 className=" text-[4rem] below-1000:text-[2rem] below-695:text-[1rem] uppercase ">
                    Search again Bruh...
                  </h1>
                </div>
              ) : paginatedData.products?.length === 0 ? (
                <div className=" h-screen   flex items-center justify-center">
                  <LoadingAnimation />
                </div>
              ) : (
                <div>
                  {loading ? (
                    <>
                      <div className=" h-screen   flex items-center justify-center">
                        <LoadingAnimation />
                      </div>
                    </>
                  ) : (
                    <CategoriesRelatedProduct
                      categoryPageData={true}
                      relatedProduct={paginatedData.products}
                      callToast={callToast}
                    />
                  )}
                </div>
              )}
            </div>

            <div className=" h-[4rem] ">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={paginatedData.totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>

          {/* below 445 */}
          <div
            className={`productsRight hidden below-445:block  below-378:hidden flex-grow   transition-all duration-500 ${
              filterVisible ? "ml-[0vw]" : "ml-[-55vw] "
            }`}
          >
            <div className={`min-h-[90vh] `}>
              {productsFound === false ? (
                <div className=" text-center self-center">
                  <h1 className=" text-[4rem] below-1000:text-[2rem] below-695:text-[1rem] uppercase ">
                    No Products found Lmao 😂
                  </h1>
                  <h1 className=" text-[4rem] below-1000:text-[2rem] below-695:text-[1rem] uppercase  ">
                    What you Filtering ?
                  </h1>
                  <h1 className=" text-[4rem] below-1000:text-[2rem] below-695:text-[1rem] uppercase ">
                    Search again Bruh...
                  </h1>
                </div>
              ) : paginatedData.products?.length === 0 ? (
                <div className=" h-screen below-445:h-[10rem]  flex items-center justify-center">
                  <LoadingAnimation />
                </div>
              ) : (
                <div>
                  {loading ? (
                    <>
                      <div className=" h-screen below-445:h-[10rem] flex items-center justify-center">
                        <LoadingAnimation />
                      </div>
                    </>
                  ) : (
                    <CategoriesRelatedProduct
                      categoryPageData={true}
                      relatedProduct={paginatedData.products}
                      callToast={callToast}
                    />
                  )}
                </div>
              )}
            </div>

            <div className=" h-[4rem] ">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={paginatedData.totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>

          {/* below 378 */}

          <div
            className={`productsRight hidden below-378:block  flex-grow   transition-all duration-500 ${
              filterVisible ? "ml-[0vw]" : "ml-[-60vw] "
            }`}
          >
            <div className={`min-h-[90vh] `}>
              {productsFound === false ? (
                <div className=" text-center self-center">
                  <h1 className=" text-[4rem] below-1000:text-[2rem] below-695:text-[1rem] uppercase ">
                    No Products found Lmao 😂
                  </h1>
                  <h1 className=" text-[4rem] below-1000:text-[2rem] below-695:text-[1rem] uppercase  ">
                    What you Filtering ?
                  </h1>
                  <h1 className=" text-[4rem] below-1000:text-[2rem] below-695:text-[1rem] uppercase ">
                    Search again Bruh...
                  </h1>
                </div>
              ) : paginatedData.products?.length === 0 ? (
                <div className=" h-screen  flex items-center justify-center">
                  <LoadingAnimation />
                </div>
              ) : (
                <div>
                  {loading ? (
                    <>
                      <div className=" h-screen  flex items-center justify-center">
                        <LoadingAnimation />
                      </div>
                    </>
                  ) : (
                    <CategoriesRelatedProduct
                      categoryPageData={true}
                      relatedProduct={paginatedData.products}
                      callToast={callToast}
                    />
                  )}
                </div>
              )}
            </div>

            <div className=" h-[4rem] ">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={paginatedData.totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
        </div>

        <MainFooter />
      </div>
    </div>
  );
};

export default Page;
