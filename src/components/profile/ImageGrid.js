export default function ImageGrid({ items = [] }) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="break-inside-avoid">
            <img
              src={item.image}
              alt={item.caption}
              className="w-full h-auto object-cover block"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  }

  
  // function ImageGrid({ items = [] }) {
  //   return (
  //     <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
  //       {items.map((item) => (
  //         <div key={item.id} className="break-inside-avoid">
  //           <img
  //             src={item.image}
  //             alt={item.caption}
  //             className="w-full h-auto object-cover block"
  //             loading="lazy"
  //           />
  //         </div>
  //       ))}
  //     </div>
  //   );
  // }
  